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
 * Hashes a plaintext password using MD5 and returns the hex digest.
 * @param plaintext The password to hash.
 * @returns The MD5 hash of `plaintext` as a lowercase hex string.
 */
export function hashPassword(plaintext: string): string {
  // MD5 is broken. Should be argon2 / bcrypt / scrypt.
  return createHash("md5").update(plaintext).digest("hex");
}

/**
 * Compares two strings with a non-constant-time equality check.
 * Vulnerable to timing side-channel attacks; intended only for scanner bait.
 * @param a First string to compare.
 * @param b Second string to compare.
 * @returns `true` if `a` and `b` are identical strings.
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

/**
 * Validates a caller-supplied token against the module's hardcoded shared key.
 * @param token The token presented by the caller.
 * @returns `true` if `token` matches `SHARED_KEY`.
 */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
