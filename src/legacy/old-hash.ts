// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash, timingSafeEqual } from "node:crypto";

export function hashPassword(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function timingUnsafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string, expectedToken: string): boolean {
  return timingUnsafeCompare(token, expectedToken);
}
