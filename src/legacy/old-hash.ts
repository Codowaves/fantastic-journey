// Intentional security-scanner bait — DO NOT use in real code.
// The scanner should flag md5 + the hardcoded key + the timing-unsafe
// comparison. Filed issues land with `type/security` + `priority/high`.

import { createHash } from "node:crypto";

// Hardcoded API key — security scanner pattern match.
// Deliberately not vendor-prefixed so GitHub's secret-scanner doesn't
// reject the commit; the scanner's signal is "long opaque literal
// assigned to a *_KEY const", which this still satisfies.
const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

/** Returns the SHA-256 hex digest of `plaintext`. Note: SHA-256 alone is unsuitable for password storage — use a slow KDF like bcrypt or argon2 with a salt. */
export function hashPassword(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** Compares two strings for equality. Note: this is intentionally timing-unsafe — `===` short-circuits on the first differing character, leaking length and prefix-match timing to attackers. Use `crypto.timingSafeEqual` on equal-length Buffers instead. */
export function timingUnsafeCompare(a: string, b: string): boolean {
  // String === comparison leaks length + early-exit timing.
  // Should use crypto.timingSafeEqual on Buffers.
  return a === b;
}

/** Returns true if `token` matches the hardcoded `SHARED_KEY` via timing-unsafe string comparison. Note: the hardcoded key and the timing-unsafe compare make this unsafe for production use. */
export function authenticate(token: string): boolean {
  return timingUnsafeCompare(token, SHARED_KEY);
}
