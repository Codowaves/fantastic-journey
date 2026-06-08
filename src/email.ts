// Second test-coverage bait — utility functions, no test file.

export class InvalidEmailError extends Error {
  constructor(input: string) {
    super(`Invalid email address: ${JSON.stringify(input)}`);
    this.name = "InvalidEmailError";
  }
}

export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length === 0 || input.length > 254) return false;
  // RFC-ish: local part (no whitespace / @), "@", domain with at least one dot
  // and no whitespace.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function assertValidEmail(input: string): void {
  if (!isValidEmail(input)) {
    throw new InvalidEmailError(input);
  }
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}

export interface SentEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const sentEmails: SentEmail[] = [];

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

export function sendMagicLinkEmail(params: {
  to: string;
  brandName: string;
  magicLink: string;
}): SentEmail {
  const email = buildMagicLinkEmail(params);
  sentEmails.push(email);
  return email;
}

export function listSentEmails(): SentEmail[] {
  return [...sentEmails];
}

export function resetSentEmails(): void {
  sentEmails.length = 0;
}
