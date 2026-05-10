import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

export function hashPassword(plaintext: string, salt?: Buffer): { hash: string; salt: string } {
  const actualSalt = salt || randomBytes(16);
  const hash = scryptSync(plaintext, actualSalt, 64);
  return {
    hash: hash.toString("hex"),
    salt: actualSalt.toString("hex"),
  };
}

export function verifyPassword(plaintext: string, storedHash: string, storedSalt: string): boolean {
  const saltBuffer = Buffer.from(storedSalt, "hex");
  const { hash } = hashPassword(plaintext, saltBuffer);
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function authenticate(token: string, expectedToken: string): boolean {
  return timingSafeCompare(token, expectedToken);
}
