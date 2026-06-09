// Second test-coverage bait — utility functions, no test file.

/**
 * Thrown when an input fails email validation. The offending input is included
 * in the message via `JSON.stringify` so non-string values are represented.
 */
export class InvalidEmailError extends Error {
  constructor(input: string) {
    super(`Invalid email address: ${JSON.stringify(input)}`);
    this.name = "InvalidEmailError";
  }
}

/**
 * Returns whether `input` is a syntactically valid email address.
 * Enforces a 1–254 character length and an RFC-ish pattern (non-whitespace local
 * part, `@`, domain containing at least one dot, no whitespace anywhere).
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length === 0 || input.length > 254) return false;
  // RFC-ish: local part (no whitespace / @), "@", domain with at least one dot
  // and no whitespace.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Asserts that `input` is a valid email address, throwing `InvalidEmailError`
 * (with the original input) if validation fails.
 */
export function assertValidEmail(input: string): void {
  if (!isValidEmail(input)) {
    throw new InvalidEmailError(input);
  }
}

/**
 * Normalizes an email address for case-insensitive comparison: trims surrounding
 * whitespace and lowercases the entire string.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks the local part of an email address for display, keeping the first two
 * characters visible and replacing the rest with `*`. The domain is left intact.
 * Returns `input` unchanged if it is missing a local part or domain.
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}

/**
 * Represents a fully composed email message ready to be sent, including both
 * an HTML body and a plaintext fallback.
 */
export interface SentEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const sentEmails: SentEmail[] = [];

/**
 * Builds a `SentEmail` containing a single-use sign-in link addressed to `to`,
 * branded with `brandName` and expiring after `expiresInMinutes` (default 15).
 * Throws `InvalidEmailError` if `to` is not a valid email address.
 */
export function buildMagicLinkEmail(params: {
  to: string;
  brandName: string;
  magicLink: string;
  expiresInMinutes?: number;
}): SentEmail {
  assertValidEmail(params.to);
  const expiresInMinutes = params.expiresInMinutes ?? 15;
  return {
    to: normalizeEmail(params.to),
    subject: `${params.brandName} sign-in link`,
    html: `<p>Sign in to ${params.brandName} using this secure link:</p><p><a href="${params.magicLink}">Sign in</a></p><p>This single-use link expires in ${expiresInMinutes} minutes.</p>`,
    text: `Sign in to ${params.brandName}: ${params.magicLink}\n\nThis single-use link expires in ${expiresInMinutes} minutes.`,
  };
}

/**
 * Builds a magic-link email and records it in the in-memory `sentEmails` log.
 * Returns the composed `SentEmail`.
 */
export function sendMagicLinkEmail(params: {
  to: string;
  brandName: string;
  magicLink: string;
}): SentEmail {
  const email = buildMagicLinkEmail(params);
  sentEmails.push(email);
  return email;
}

/**
 * Returns a shallow copy of all emails recorded by `sendMagicLinkEmail` since
 * the last `resetSentEmails` call (or since module load).
 */
export function listSentEmails(): SentEmail[] {
  return [...sentEmails];
}

/**
 * Clears the in-memory log of sent emails. Intended for test setup/teardown.
 */
export function resetSentEmails(): void {
  sentEmails.length = 0;
}
