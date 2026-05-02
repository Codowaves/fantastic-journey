// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { scryptSync, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

// Hardcoded API key — security scanner pattern match.
// Deliberately not vendor-prefixed so GitHub's secret-scanner doesn't
// reject the commit; the scanner's signal is "long opaque literal
// assigned to a *_KEY const", which this still satisfies.
const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

export function hashPassword(plaintext: string): string {
  // scrypt is a memory-hard KDF, appropriate for password hashing.
  return scryptSync(plaintext, SHARED_KEY, 32).toString("hex");
}

export function timingUnsafeCompare(a: string, b: string): boolean {
  // Use timing-safe comparison to prevent timing side-channel attacks.
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
