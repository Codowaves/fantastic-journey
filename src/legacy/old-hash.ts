// Migrated from md5 to bcrypt with per-user salt.
// Timing-unsafe comparison replaced with crypto.timingSafeEqual.
// Hardcoded key removed.

import bcrypt from "bcrypt";
import { timingSafeEqual } from "node:crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(plaintext: string): Promise<string> {
  // bcrypt automatically generates a unique salt per password
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

export function timingSafeCompare(a: string, b: string): boolean {
  // Convert strings to Buffers for timing-safe comparison
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // timingSafeEqual requires buffers of equal length
  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string, expectedToken: string): boolean {
  return timingSafeCompare(token, expectedToken);
}
