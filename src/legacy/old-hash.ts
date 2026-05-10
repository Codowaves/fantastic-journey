// Modernized crypto module using secure primitives.

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt with a random salt.
 * Returns the hash in the format: salt:hash (both hex-encoded).
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored hash.
 */
export async function verifyPassword(plaintext: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const storedBuffer = Buffer.from(hashHex, "hex");
  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;

  return timingSafeCompare(storedBuffer, derivedKey);
}

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 */
export function timingSafeCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufA = typeof a === "string" ? Buffer.from(a, "utf-8") : a;
  const bufB = typeof b === "string" ? Buffer.from(b, "utf-8") : b;

  // Ensure buffers are same length to avoid timing leak
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
}

/**
 * Authenticates a token against an expected value using timing-safe comparison.
 * Note: In production, tokens should be fetched from environment variables or a secure key store.
 */
export function authenticate(token: string, expectedToken: string): boolean {
  return timingSafeCompare(token, expectedToken);
}
