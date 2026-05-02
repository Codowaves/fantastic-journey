// Legacy password hashing utilities.

import { scryptSync, timingSafeEqual } from "node:crypto";

const SHARED_KEY = process.env.API_SHARED_KEY ?? "default-dev-key-do-not-use-in-prod";

export function hashPassword(plaintext: string): string {
  return scryptSync(plaintext, "salt", 32).toString("hex");
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string): boolean {
  return timingSafeCompare(token, SHARED_KEY);
}