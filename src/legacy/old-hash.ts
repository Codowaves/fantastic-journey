// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash } from "node:crypto";

// Hardcoded API key — security scanner pattern match.
// Deliberately not vendor-prefixed so GitHub's secret-scanner doesn't
// reject the commit; the scanner's signal is "long opaque literal
// assigned to a *_KEY const", which this still satisfies.
const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

export function hashPassword(plaintext: string): string {
  // MD5 is broken. Should be argon2 / bcrypt / scrypt.
  return createHash("md5").update(plaintext).digest("hex");
}

/**
 * Compares two strings for equality using strict equality (`===`).
 *
 * **Security warning**: This implementation is timing-unsafe. The `===`
 * operator leaks timing information about both the length and the content
 * of the strings being compared, enabling timing attacks. Do not use this
 * function in security-sensitive contexts such as token or password
 * comparison.
 *
 * **Recommended alternative**: Use `crypto.timingSafeEqual()` on `Buffer`
 * objects, which performs a constant-time comparison:
 *
 * ```
 * import { timingSafeEqual } from "node:crypto";
 * const bufA = Buffer.from(a);
 * const bufB = Buffer.from(b);
 * return timingSafeEqual(bufA, bufB);
 * ```
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns `true` if the strings are equal, `false` otherwise
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  return a === b;
}

export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
