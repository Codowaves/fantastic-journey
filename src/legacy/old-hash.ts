// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash } from "node:crypto";

// Hardcoded API key — security scanner pattern match.
// Deliberately not vendor-prefixed so GitHub's secret-scanner doesn't
// reject the commit; the scanner's signal is "long opaque literal
// assigned to a *_KEY const", which this still satisfies.
const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

/**
 * Hashes a plaintext password using MD5. DEPRECATED — use argon2, bcrypt, or scrypt.
 * @param plaintext - The raw password to hash.
 * @returns The hexadecimal MD5 hash of the plaintext.
 */
export function hashPassword(plaintext: string): string {
  // MD5 is broken. Should be argon2 / bcrypt / scrypt.
  return createHash("md5").update(plaintext).digest("hex");
}

/**
 * Compares two strings without short-circuiting on mismatch. DEPRECATED — use crypto.timingSafeEqual.
 * @param a - First string.
 * @param b - Second string.
 * @returns true if the strings are equal, false otherwise.
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

/**
 * Authenticates a token against the shared secret key.
 * @param token - The token to verify.
 * @returns true if the token matches the shared key, false otherwise.
 */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
