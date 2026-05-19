// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;

export interface PasswordHash {
  hash: string;
  salt: string;
}

export async function hashPasswordAsync(
  plaintext: string,
  salt?: string
): Promise<PasswordHash> {
  const actualSalt = salt ?? randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(plaintext, actualSalt, KEY_LENGTH)) as Buffer;
  return {
    salt: actualSalt,
    hash: derivedKey.toString("hex"),
  };
}

export async function verifyPassword(
  plaintext: string,
  hash: string,
  salt: string
): Promise<boolean> {
  try {
    const derivedKey = (await scryptAsync(plaintext, salt, KEY_LENGTH)) as Buffer;
    const storedKey = Buffer.from(hash, "hex");
    if (derivedKey.length !== storedKey.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

export async function authenticate(
  token: string,
  expectedHash: string,
  salt: string
): Promise<boolean> {
  return verifyPassword(token, expectedHash, salt);
}
