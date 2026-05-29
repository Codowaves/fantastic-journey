import { describe, it, expect } from "vitest";

import { authenticate, hashPassword, timingUnsafeCompare } from "./old-hash";

// Mirrors the private SHARED_KEY literal in old-hash.ts so authenticate() can
// be exercised without exporting the constant.
const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

describe("hashPassword", () => {
  it("returns the canonical md5 digest for a known input", () => {
    // MD5 of the empty string is a stable, well-known vector.
    expect(hashPassword("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("produces a deterministic 32-char lowercase hex digest", () => {
    const digest = hashPassword("hunter2");
    expect(digest).toMatch(/^[0-9a-f]{32}$/);
    expect(digest).toBe(hashPassword("hunter2"));
  });
});

describe("timingUnsafeCompare", () => {
  it("returns true for identical strings", () => {
    expect(timingUnsafeCompare("token", "token")).toBe(true);
  });

  it("returns false for differing or empty strings", () => {
    expect(timingUnsafeCompare("token", "tokeN")).toBe(false);
    expect(timingUnsafeCompare("token", "")).toBe(false);
  });
});

describe("authenticate", () => {
  it("accepts the shared key", () => {
    expect(authenticate(SHARED_KEY)).toBe(true);
  });

  it("rejects an empty or incorrect token", () => {
    expect(authenticate("")).toBe(false);
    expect(authenticate("not-the-key")).toBe(false);
  });
});
