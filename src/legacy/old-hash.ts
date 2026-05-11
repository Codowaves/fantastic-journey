// Security-hardened cryptographic implementations.
// Upgrades from weak patterns (MD5, hardcoded secrets, timing attacks).

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Secret key loaded from environment variable (no hardcoded secrets)
function getSharedKey(): string {
  const key = process.env.SHARED_KEY;
  if (!key) {
    throw new Error("SHARED_KEY environment variable is required");
  }
  return key;
}

/**
 * Hash a password using scrypt (secure KDF).
 * Returns salt:hash format for storage.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const saltHex = parts[0];
  const keyHex = parts[1];
  if (!saltHex || !keyHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  return timingSafeEqual(storedKey, derivedKey);
}

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 * Prevents timing attacks by comparing in constant time.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  // Early length check (length is not secret)
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

export function authenticate(token: string): boolean {
  return timingSafeCompare(token, getSharedKey());
}
