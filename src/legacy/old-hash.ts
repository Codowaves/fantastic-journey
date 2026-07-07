// Intentionally uses SHA-256 for password hashing — for production use,
// switch to a slow KDF like bcrypt or argon2 with a salt.

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Computes the SHA-256 hex digest of `plaintext`.
 *
 * Note: SHA-256 alone is unsuitable for password storage — use a slow KDF
 * like bcrypt or argon2 with a salt.
 *
 * @param plaintext - The password string to hash.
 * @returns The SHA-256 hex digest of `plaintext`.
 */
export function hashPassword(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Compares two strings for equality using a constant-time comparison.
 *
 * Returns false if the strings differ in length.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns `true` if `a` and `b` are identical, otherwise `false`.
 */
export function timingUnsafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Checks whether `token` matches the value of `process.env.SHARED_KEY`.
 *
 * Uses constant-time comparison. Returns false when `SHARED_KEY` is unset.
 *
 * @param token - The candidate token to check against the shared key.
 * @returns `true` if `token` matches `process.env.SHARED_KEY`, otherwise `false`.
 */
export function authenticate(token: string): boolean {
  const expected = process.env.SHARED_KEY ?? "";
  return timingUnsafeCompare(token, expected);
}
