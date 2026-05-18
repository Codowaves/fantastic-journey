import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(plaintext: string, salt?: string): Promise<string> {
  const actualSalt = salt ?? randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(plaintext, actualSalt, 64) as Buffer;
  return `${actualSalt}:${derivedKey.toString("hex")}`;
}

export async function authenticate(token: string, storedHash: string): Promise<boolean> {
  const idx = storedHash.indexOf(":");
  if (idx === -1) return false;
  const salt = storedHash.slice(0, idx);
  const expectedKeyHex = storedHash.slice(idx + 1);
  const expectedKey = Buffer.from(expectedKeyHex, "hex");
  if (expectedKey.length !== 64) return false;
  const derivedKey = await scryptAsync(token, salt, 64) as Buffer;
  return timingSafeEqual(expectedKey, derivedKey);
}

export async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}