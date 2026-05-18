import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(plaintext, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  plaintext: string,
  ciphertext: string,
): Promise<boolean> {
  const [salt, hash] = ciphertext.split(":");
  if (!salt || !hash) return false;
  const derivedKey = (await scryptAsync(plaintext, salt, KEY_LENGTH)) as Buffer;
  return timingSafeEqualBuffer(derivedKey.toString("hex"), hash);
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

export function timingSafeEqualBuffer(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function authenticate(
  password: string,
  storedHash: string,
): Promise<boolean> {
  return verifyPassword(password, storedHash);
}
