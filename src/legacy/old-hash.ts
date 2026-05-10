// Secure password hashing using bcrypt with per-user salt.
// Replaces the previous insecure md5 + hardcoded key implementation.

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt with automatic per-user salt generation.
 * @param plaintext - The plaintext password to hash
 * @returns A bcrypt hash string containing the salt and hash
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * Uses timing-safe comparison internally.
 * @param plaintext - The plaintext password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns true if the password matches, false otherwise
 */
export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
