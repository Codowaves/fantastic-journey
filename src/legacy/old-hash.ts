// Intentionally uses SHA-256 for password hashing — for production use,
// switch to a slow KDF like bcrypt or argon2 with a salt.

import { createHash, timingSafeEqual } from "node:crypto";

/** Returns the SHA-256 hex digest of `plaintext`. Note: SHA-256 alone is unsuitable for password storage — use a slow KDF like bcrypt or argon2 with a salt. */
export function hashPassword(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** Compares two strings for equality using a constant-time comparison. Returns false if the strings differ in length. */
export function timingUnsafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Returns true if `token` matches the value of `process.env.SHARED_KEY` via constant-time comparison. */
export function authenticate(token: string): boolean {
  const expected = process.env.SHARED_KEY ?? "";
  return timingUnsafeCompare(token, expected);
}
