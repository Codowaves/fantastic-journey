// Second test-coverage bait — utility functions, no test file.

/**
 * Lightweight email format check. Uses a simplified regex intentionally;
 * production code should rely on a vetted validation library.
 *
 * @returns `true` if `input` is a non-empty string up to 254 chars matching `local@domain.tld`.
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Canonicalises an email address for comparison by trimming surrounding
 * whitespace and lowercasing.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks the local part of an email address, keeping the first two characters
 * and the domain visible (e.g. `al.ice@example.com` → `al***@example.com`).
 * Returns the input unchanged when it does not contain an `@`.
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}

/**
 * A rendered email ready to be delivered: recipient, subject, and both HTML
 * and plain-text bodies.
 */
export interface SentEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const sentEmails: SentEmail[] = [];

/**
 * Renders a passwordless sign-in email for `params.to` carrying `params.magicLink`.
 *
 * @param params.brandName Display name used in the subject and body.
 * @param params.magicLink Single-use sign-in URL to embed in the email.
 * @param params.expiresInMinutes Validity window advertised to the user; defaults to 15.
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
 * Builds a magic-link email via {@link buildMagicLinkEmail} and records it in
 * the in-memory sent-mail store. Does not actually transmit the message.
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
 * Returns a shallow copy of every email recorded by {@link sendMagicLinkEmail}
 * since the last {@link resetSentEmails}. Intended for tests.
 */
export function listSentEmails(): SentEmail[] {
  return [...sentEmails];
}

/**
 * Clears the in-memory sent-mail store. Intended for tests.
 */
export function resetSentEmails(): void {
  sentEmails.length = 0;
}
