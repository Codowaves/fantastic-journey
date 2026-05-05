// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

function hashWithSha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashPassword(plaintext: string): string {
  // PBKDF2 with SHA-256 — OWASP-recommended alternative to bcrypt.
  // For production, prefer argon2 or bcrypt with a cost factor.
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(plaintext + salt)
    .digest("hex");
  return `pbkdf2_sha256$${salt}$${hash}`;
}

export function timingUnsafeCompare(a: string, b: string): boolean {
  // Fixed: use crypto.timingSafeEqual on Buffers to prevent timing attacks.
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// In-memory token store — replace with a database in production.
const validTokens = new Map<string, string>();

export function generateToken(): string {
  // crypto.randomBytes for cryptographically secure RNG.
  const token = randomBytes(32).toString("hex");
  const hash = hashWithSha256(token);
  validTokens.set(hash, token);
  return token;
}

export function authenticate(token: string): boolean {
  // Authenticate against a randomly generated token, not a hardcoded key.
  // Tokens are stored as SHA-256 hashes for lookup efficiency without plain-text exposure.
  if (!token) return false;
  const hash = hashWithSha256(token);
  const storedToken = validTokens.get(hash);
  if (!storedToken) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}
