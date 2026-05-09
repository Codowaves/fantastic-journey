// Secure cryptographic implementations using modern Node.js crypto APIs.
// Upgraded from weak patterns (MD5, hardcoded secrets, timing attacks).

import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

// Load API key from environment variable instead of hardcoding
const SHARED_KEY = process.env.API_SHARED_KEY;

if (!SHARED_KEY) {
  throw new Error("API_SHARED_KEY environment variable is required");
}

/**
 * Hash a password using scrypt (CPU/memory-hard KDF).
 * @param plaintext - The password to hash
 * @param salt - Optional salt (generates random 16-byte salt if not provided)
 * @returns Hex-encoded hash in format: salt$hash
 */
export function hashPassword(plaintext: string, salt?: Buffer): string {
  const actualSalt = salt || randomBytes(16);
  // scrypt with N=16384, r=8, p=1 (recommended params for interactive login)
  const hash = scryptSync(plaintext, actualSalt, 64);
  return `${actualSalt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Verify a password against a stored hash.
 * @param plaintext - The password to verify
 * @param storedHash - The hash in format: salt$hash
 * @returns True if password matches
 */
export function verifyPassword(plaintext: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split("$");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedHashBuffer = Buffer.from(hashHex, "hex");
  const computedHash = scryptSync(plaintext, salt, 64);

  return timingSafeCompare(computedHash, storedHashBuffer);
}

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 * Converts strings to buffers of equal length to prevent timing attacks.
 */
export function timingSafeCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufA = typeof a === "string" ? Buffer.from(a, "utf8") : a;
  const bufB = typeof b === "string" ? Buffer.from(b, "utf8") : b;

  // timingSafeEqual requires equal-length buffers
  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * Authenticate a token against the shared API key using constant-time comparison.
 */
export function authenticate(token: string): boolean {
  // SHARED_KEY is validated at module load, safe to assert non-null
  return timingSafeCompare(token, SHARED_KEY!);
}
