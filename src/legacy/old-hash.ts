import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const PASSWORD_HASH_ALGO = "sha256";

export function hashPassword(plaintext: string): string {
  return createHash(PASSWORD_HASH_ALGO).update(plaintext).digest("hex");
}

export function timingUnsafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function authenticate(token: string, validToken: string): boolean {
  return timingUnsafeCompare(token, validToken);
}