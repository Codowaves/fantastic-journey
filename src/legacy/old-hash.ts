// Secure cryptographic implementations using node:crypto best practices.

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Key should be loaded from environment variable in production
const SHARED_KEY = process.env.API_SHARED_KEY || "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

/**
 * Hash password using scrypt (modern, secure KDF).
 * Returns a string containing salt and hash for storage.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify password against stored hash.
 */
export async function verifyPassword(plaintext: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(hash, "hex");

  return timingSafeCompare(derivedKey, storedBuffer);
}

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 */
export function timingSafeCompare(a: string | Buffer, b: string | Buffer): boolean {
  const bufA = typeof a === "string" ? Buffer.from(a) : a;
  const bufB = typeof b === "string" ? Buffer.from(b) : b;

  // Length must match for timingSafeEqual
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string): boolean {
  return timingSafeCompare(token, SHARED_KEY);
}
