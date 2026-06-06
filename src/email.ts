// Second test-coverage bait — utility functions, no test file.

/**
 * Returns true if the input is a structurally valid email address
 * (non-empty, <= 254 chars, matches a basic local@domain.tld pattern).
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Trims surrounding whitespace and lowercases the address so callers can
 * compare or deduplicate emails in a case-insensitive way.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Replaces all but the first two characters of the local part with asterisks,
 * leaving the domain intact. Returns the original string unchanged when it
 * does not contain an `@` separator.
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}

/**
 * Shape of a single email produced by the magic-link helpers — the recipient,
 * subject line, and both HTML and plain-text bodies.
 */
export interface SentEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const sentEmails: SentEmail[] = [];

/**
 * Renders a SentEmail for a passwordless sign-in link, using `brandName` in
 * the subject and body. The link expiry is `expiresInMinutes` minutes
 * (default 15); `to` is normalized before being stored.
 */
export function buildMagicLinkEmail(params: {
  to: string;
  brandName: string;
  magicLink: string;
  expiresInMinutes?: number;
}): SentEmail {
  const expiresInMinutes = params.expiresInMinutes ?? 15;
  return {
    to: normalizeEmail(params.to),
    subject: `${params.brandName} sign-in link`,
    html: `<p>Sign in to ${params.brandName} using this secure link:</p><p><a href="${params.magicLink}">Sign in</a></p><p>This single-use link expires in ${expiresInMinutes} minutes.</p>`,
    text: `Sign in to ${params.brandName}: ${params.magicLink}\n\nThis single-use link expires in ${expiresInMinutes} minutes.`,
  };
}

/**
 * Builds a magic-link email via {@link buildMagicLinkEmail} and appends it
 * to the in-memory `sentEmails` log, returning the rendered message.
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
 * Returns a shallow copy of every email recorded by
 * {@link sendMagicLinkEmail} so far, in send order.
 */
export function listSentEmails(): SentEmail[] {
  return [...sentEmails];
}

/**
 * Empties the in-memory `sentEmails` log. Intended for test teardown so
 * suites can start each case with a clean slate.
 */
export function resetSentEmails(): void {
  sentEmails.length = 0;
}
