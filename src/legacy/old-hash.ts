// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "node:process";

const SHARED_KEY = env.API_SECRET ?? "default-dev-secret";

/**
 * Hashes a plaintext password using SHA-256.
 * @param plaintext - The password to hash
 * @returns Hex-encoded hash
 */
export function hashPassword(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Compares two strings in constant time to prevent timing attacks.
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
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
 * Authenticates a token against the configured API secret.
 * @param token - Token to authenticate
 * @returns True if token matches the configured secret
 */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
