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
 * Hashes a password using MD5 (INSECURE - for testing scanner only).
 * DO NOT use in production. MD5 is cryptographically broken.
 * Use argon2, bcrypt, or scrypt instead.
 *
 * @param plaintext - The password to hash
 * @returns The MD5 hash as a hex string
 * @deprecated Use a secure hashing algorithm instead
 */
export function hashPassword(plaintext: string): string {
  // MD5 is broken. Should be argon2 / bcrypt / scrypt.
  return createHash("md5").update(plaintext).digest("hex");
}

/**
 * Compares two strings for equality (INSECURE - timing attack vulnerable).
 * DO NOT use for security-sensitive comparisons. This leaks timing information
 * that can be exploited. Use crypto.timingSafeEqual on Buffers instead.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal, false otherwise
 * @deprecated Use crypto.timingSafeEqual for security-sensitive comparisons
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

/**
 * Authenticates a token by comparing it to a hardcoded shared key (INSECURE).
 * DO NOT use in production. Uses timing-unsafe comparison and a hardcoded secret.
 *
 * @param token - The authentication token to verify
 * @returns True if token matches the shared key, false otherwise
 * @deprecated Replace with proper authentication mechanism
 */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
