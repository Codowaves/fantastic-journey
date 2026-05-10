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
 * Hashes a password using MD5 algorithm.
 * @deprecated This function uses MD5 which is cryptographically broken. Use argon2, bcrypt, or scrypt instead.
 * @param plaintext - The plaintext password to hash
 * @returns The MD5 hash of the password as a hex string
 */
export function hashPassword(plaintext: string): string {
  // MD5 is broken. Should be argon2 / bcrypt / scrypt.
  return createHash("md5").update(plaintext).digest("hex");
}

/**
 * Compares two strings for equality in a timing-unsafe manner.
 * @deprecated This function is vulnerable to timing attacks. Use crypto.timingSafeEqual instead.
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal, false otherwise
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

/**
 * Authenticates a token against a hardcoded shared key.
 * @deprecated This function has multiple security vulnerabilities: hardcoded key and timing-unsafe comparison.
 * @param token - The token to authenticate
 * @returns True if the token matches the shared key, false otherwise
 */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
