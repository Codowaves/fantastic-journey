// Secure cryptographic implementations using Node.js crypto module.
// Uses scrypt for password hashing and timingSafeEqual for constant-time comparison.

import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

// Salt length for scrypt (128 bits recommended by OWASP)
const SALT_LENGTH = 16;
// Key length for scrypt output (256 bits)
const KEY_LENGTH = 32;
// Scrypt parameters: N=16384, r=8, p=1 (OWASP recommended defaults)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

/**
 * Hash a password using scrypt with a random salt.
 * Returns format: salt:hash (both hex-encoded)
 */
export function hashPassword(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(plaintext, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify a password against a stored hash.
 * @param plaintext The password to verify
 * @param stored The stored hash in format salt:hash
 */
export function verifyPassword(plaintext: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedHash = Buffer.from(hashHex, "hex");
  const hash = scryptSync(plaintext, salt, KEY_LENGTH, SCRYPT_PARAMS);

  return timingSafeEqual(hash, storedHash);
}

/**
 * Timing-safe comparison of two strings.
 * Prevents timing attacks by ensuring comparison takes constant time.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  // Convert strings to buffers with fixed encoding
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  // If lengths differ, still perform comparison to avoid timing leak
  // by comparing against a same-length dummy buffer
  if (bufA.length !== bufB.length) {
    const dummy = Buffer.alloc(bufA.length);
    timingSafeEqual(bufA, dummy);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * Authenticate a token against a stored secret.
 * NOTE: In production, use environment variables for secrets, never hardcode them.
 * Example: const SHARED_KEY = process.env.API_SECRET_KEY;
 */
export function authenticate(token: string, secretKey: string): boolean {
  return timingSafeCompare(token, secretKey);
}
