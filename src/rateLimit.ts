/**
 * Per-route token-bucket rate limiter for auth endpoints.
 *
 * Buckets are keyed by `(route, ip, workspaceId, userId?)` and refill at a
 * fixed per-minute rate. Over-limit attempts return a `denied` decision along
 * with a `Retry-After` (seconds) hint that the caller can pass back to the
 * client as a `Retry-After` header.
 */

/** A named auth route whose traffic is subject to rate limiting. */
export type RateLimitedRoute =
  | "auth_magic_link"
  | "auth_magic_link_verify"
  | "auth_password"
  | "auth_saml";

/** Identity inputs used to scope a rate-limit bucket. */
export interface RateLimitIdentity {
  ip: string | null;
  workspaceId: string | null;
  userId?: string | null;
}

/** Outcome of a rate-limit check. */
export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds the caller should wait before retrying. `0` when allowed. */
  retryAfterSeconds: number;
  /** Configured limit (requests per window) for the route. */
  limit: number;
  /** Remaining tokens in the bucket after this attempt. */
  remaining: number;
}

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const WINDOW_MS = 60_000;

const DEFAULTS: Record<RateLimitedRoute, number> = {
  auth_magic_link: 10,
  auth_magic_link_verify: 20,
  auth_password: 10,
  auth_saml: 10,
};

const ENV_VAR_BY_ROUTE: Record<RateLimitedRoute, string> = {
  auth_magic_link: "MAGIC_LINK_REQUEST_RPM",
  auth_magic_link_verify: "MAGIC_LINK_VERIFY_RPM",
  auth_password: "AUTH_PASSWORD_RPM",
  auth_saml: "AUTH_SAML_RPM",
};

const buckets = new Map<string, Bucket>();

/** Builds the bucket key from the route and identity. */
function bucketKey(
  route: RateLimitedRoute,
  identity: RateLimitIdentity,
): string {
  const ip = identity.ip ?? "_anon";
  const ws = identity.workspaceId ?? "_ws";
  const user = identity.userId ?? "_user";
  return `${route}|${ip}|${ws}|${user}`;
}

/** Reads the configured per-minute limit for a route, falling back to defaults. */
export function getRouteLimit(route: RateLimitedRoute): number {
  const envVar = ENV_VAR_BY_ROUTE[route];
  const raw = process.env[envVar];
  if (raw === undefined) return DEFAULTS[route];
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULTS[route];
  return parsed;
}

/**
 * Attempts to consume a single token for the given route+identity. When the
 * bucket is empty the call is denied and `retryAfterSeconds` reflects the
 * time until at least one token is available.
 */
export function consumeRateLimit(
  route: RateLimitedRoute,
  identity: RateLimitIdentity,
  now: Date = new Date(),
): RateLimitDecision {
  const limit = getRouteLimit(route);
  const key = bucketKey(route, identity);
  const nowMs = now.getTime();
  const existing = buckets.get(key);

  let tokens: number;
  let lastRefillMs: number;
  if (existing) {
    const elapsed = nowMs - existing.lastRefillMs;
    const refilled = elapsed > 0 ? (elapsed / WINDOW_MS) * limit : 0;
    tokens = Math.min(limit, existing.tokens + refilled);
    lastRefillMs = nowMs;
  } else {
    tokens = limit;
    lastRefillMs = nowMs;
  }

  if (tokens >= 1) {
    buckets.set(key, { tokens: tokens - 1, lastRefillMs });
    return {
      allowed: true,
      retryAfterSeconds: 0,
      limit,
      remaining: Math.floor(tokens - 1),
    };
  }

  const deficit = 1 - tokens;
  const retryAfterSeconds = Math.max(1, Math.ceil((deficit / limit) * 60));
  buckets.set(key, { tokens, lastRefillMs });
  return { allowed: false, retryAfterSeconds, limit, remaining: 0 };
}

/** Clears every bucket. Intended for tests. */
export function resetRateLimitState(): void {
  buckets.clear();
}
