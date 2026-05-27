// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

import {
  authenticatePassword,
  authenticateSaml,
  contextFromRequest,
  getActiveSession,
  isWorkspaceOwner,
  listActiveSessions,
  listAuthEvents,
  recordAuthEvent,
  redeemMagicLinkToken,
  revokeSession,
  saveSamlMetadata,
  createMagicLinkToken,
} from "../auth";
import { maskEmail, sendMagicLinkEmail } from "../email";

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export function createOrder(
  customerId: string,
  items: Array<{ id: string; qty: number }>,
): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(
  orderId: string,
): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;

// In-memory projects store — in production this would be a database query.
// Guard against undefined rows by defaulting to empty array.
const projects: Array<{ id: string; name: string; created_at: string }> = [];
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 60_000;
const contactRateLimitRequests = new Map<string, number[]>();

function getProjects(): Array<{
  id: string;
  name: string;
  created_at: string;
}> {
  return projects ?? [];
}

export function resetContactRateLimit(): void {
  contactRateLimitRequests.clear();
}

function forwardedIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

function pruneContactRateLimitRequests(now: number): void {
  const windowStart = now - CONTACT_RATE_LIMIT_WINDOW_MS;

  for (const [ip, requests] of contactRateLimitRequests) {
    const recentRequests = requests.filter(
      (timestamp) => timestamp > windowStart,
    );

    if (recentRequests.length === 0) {
      contactRateLimitRequests.delete(ip);
    } else {
      contactRateLimitRequests.set(ip, recentRequests);
    }
  }
}

function checkContactRateLimit(
  request: Request,
  now = Date.now(),
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const ip = forwardedIp(request);
  pruneContactRateLimitRequests(now);
  const recentRequests = contactRateLimitRequests.get(ip) ?? [];

  if (recentRequests.length >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    const oldestRequest = recentRequests[0] ?? now;
    const retryAfterMs =
      oldestRequest + CONTACT_RATE_LIMIT_WINDOW_MS - now;
    contactRateLimitRequests.set(ip, recentRequests);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
    };
  }

  recentRequests.push(now);
  contactRateLimitRequests.set(ip, recentRequests);
  return { allowed: true };
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function requireString(
  body: Record<string, unknown>,
  key: string,
): string | null {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function sessionCookie(sessionId: string): string {
  return `fj_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/`;
}

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === name) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return rawValue.join("=");
      }
    }
  }
  return null;
}

function requireOwnerSession(request: Request): {
  workspaceId: string;
  userId: string;
} | null {
  const session = getActiveSession(getCookie(request, "fj_session"));
  if (!session || !isWorkspaceOwner(session.workspaceId, session.userId)) {
    return null;
  }

  return { workspaceId: session.workspaceId, userId: session.userId };
}

function escapeHtml(value: string | null): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSessionsPage(workspaceId: string): string {
  const rows = listActiveSessions(workspaceId)
    .map(
      (session) =>
        `<tr><td>${escapeHtml(session.email)}</td><td>${escapeHtml(
          session.ip,
        )}</td><td>${escapeHtml(session.userAgent)}</td><td>${escapeHtml(
          session.startedAt,
        )}</td><td>${escapeHtml(
          session.lastSeenAt,
        )}</td><td><form method="post" action="/settings/security/sessions/revoke"><input type="hidden" name="sessionId" value="${escapeHtml(
          session.id,
        )}"><button type="submit">Revoke</button></form></td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><title>Active sessions</title></head><body><main><h1>Active sessions</h1><table><thead><tr><th>User</th><th>IP</th><th>UA</th><th>Started</th><th>Last seen</th><th>Revoke</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
}

async function readFormBody(request: Request): Promise<URLSearchParams> {
  return new URLSearchParams(await request.text());
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const context = contextFromRequest(request);

  if (
    request.method === "GET" &&
    (url.pathname === "/healthz" || url.pathname === "/health")
  ) {
    return Response.json(
      { status: "ok", uptimeSeconds: process.uptime() },
      { status: 200 },
    );
  }

  if (request.method === "GET" && url.pathname === "/api/projects") {
    return Response.json({ items: getProjects() }, { status: 200 });
  }

  if (request.method === "GET" && url.pathname === "/api/auth-events") {
    return Response.json({ items: listAuthEvents() }, { status: 200 });
  }

  if (request.method === "POST" && url.pathname === "/api/contact") {
    const limit = checkContactRateLimit(request);
    if (!limit.allowed) {
      return Response.json(
        { error: "Too many contact requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    return Response.json({ submitted: true }, { status: 202 });
  }

  if (
    request.method === "POST" &&
    url.pathname === "/settings/security/saml/metadata"
  ) {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    if (!workspaceId) {
      return Response.json({ error: "workspaceId is required" }, { status: 400 });
    }

    try {
      const metadata = await saveSamlMetadata({
        workspaceId,
        xml:
          requireString(body, "xml") ??
          requireString(body, "metadataXml") ??
          undefined,
        metadataUrl: requireString(body, "metadataUrl") ?? undefined,
        timeoutMs:
          typeof body.timeoutMs === "number" ? body.timeoutMs : undefined,
      });
      return Response.json(
        {
          workspaceId: metadata.workspaceId,
          source: metadata.source,
          entityId: metadata.entityId,
          ssoUrl: metadata.ssoUrl,
        },
        { status: 200 },
      );
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "metadata rejected",
        },
        { status: 400 },
      );
    }
  }

  if (request.method === "POST" && url.pathname === "/auth/saml") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const assertion =
      requireString(body, "assertionXml") ??
      requireString(body, "samlResponse") ??
      requireString(body, "assertion");

    if (!workspaceId || !assertion) {
      recordAuthEvent({
        workspaceId,
        kind: "fail",
        reason: "saml_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId and assertion are required" },
        { status: 400 },
      );
    }

    const result = authenticateSaml({
      workspaceId,
      assertion,
      expectedAudience: `fantastic-journey:${workspaceId}`,
      expectedDestination: `${url.origin}/auth/saml`,
      context,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (request.method === "POST" && url.pathname === "/auth/magic-link") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const email = requireString(body, "email");
    const brandName = requireString(body, "brandName") ?? "Fantastic Journey";

    if (!workspaceId || !email) {
      recordAuthEvent({
        workspaceId,
        kind: "fail",
        reason: "magic_link_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId and email are required" },
        { status: 400 },
      );
    }

    const token = createMagicLinkToken({ workspaceId, email, context });
    const magicLink = `${url.origin}/auth/magic-link/verify?token=${encodeURIComponent(
      token.token,
    )}`;
    sendMagicLinkEmail({ to: token.email, brandName, magicLink });

    return Response.json(
      {
        sent: true,
        email: maskEmail(token.email),
        expiresAt: token.expiresAt,
      },
      { status: 202 },
    );
  }

  if (request.method === "GET" && url.pathname === "/auth/magic-link/verify") {
    const token = url.searchParams.get("token");
    if (!token) {
      recordAuthEvent({
        kind: "fail",
        reason: "magic_token_missing",
        context,
      });
      return Response.json({ error: "token is required" }, { status: 400 });
    }

    const result = redeemMagicLinkToken({ token, context });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (request.method === "POST" && url.pathname === "/auth/password") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const userId = requireString(body, "userId");
    const password = requireString(body, "password");

    if (!workspaceId || !userId || !password) {
      recordAuthEvent({
        workspaceId,
        userId,
        kind: "fail",
        reason: "password_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId, userId, and password are required" },
        { status: 400 },
      );
    }

    const result = authenticatePassword({
      workspaceId,
      userId,
      password,
      context,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (
    request.method === "GET" &&
    url.pathname === "/settings/security/sessions"
  ) {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return new Response(renderSessionsPage(ownerSession.workspaceId), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (
    request.method === "POST" &&
    url.pathname === "/settings/security/sessions/revoke"
  ) {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    const sessionId = contentType.includes("application/json")
      ? requireString(await readJsonBody(request), "sessionId")
      : (await readFormBody(request)).get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const revoked = revokeSession({
      workspaceId: ownerSession.workspaceId,
      actorUserId: ownerSession.userId,
      sessionId,
    });
    return Response.json({ revoked }, { status: revoked ? 200 : 404 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
