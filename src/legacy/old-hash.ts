import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 32;
const HASH_LENGTH = 64;

export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = await scryptAsync(plaintext, salt, HASH_LENGTH);
  return `${salt}:${(hash as Buffer).toString("hex")}`;
}

export async function verifyPassword(
  plaintext: string,
  hashed: string,
): Promise<boolean> {
  const [salt, originalHash] = hashed.split(":");
  if (!salt || !originalHash) return false;

  const inputHash = await scryptAsync(plaintext, salt, HASH_LENGTH);
  const inputHex = (inputHash as Buffer).toString("hex");

  const bufA = Buffer.from(inputHex);
  const bufB = Buffer.from(originalHash);

  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string, sharedSecret: string): boolean {
  return timingSafeCompare(token, sharedSecret);
}
