import { describe, expect, it } from "vitest";

import { authenticate, hashPassword, timingUnsafeCompare } from "./old-hash";

describe("old-hash helpers", () => {
  describe("hashPassword", () => {
    it("returns the MD5 hex digest of the plaintext", () => {
      expect(hashPassword("hello")).toBe("5d41402abc4b2a76b9719d911017c592");
      expect(hashPassword("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    });

    it("is deterministic and produces a 32-character hex string", () => {
      const digest = hashPassword("correct horse battery staple");
      expect(digest).toBe(hashPassword("correct horse battery staple"));
      expect(digest).toMatch(/^[0-9a-f]{32}$/);
    });
  });

  describe("timingUnsafeCompare", () => {
    it("returns true when both strings are identical", () => {
      expect(timingUnsafeCompare("token", "token")).toBe(true);
    });

    it("returns false when the strings differ in content or length", () => {
      expect(timingUnsafeCompare("token", "tokenx")).toBe(false);
      expect(timingUnsafeCompare("a", "b")).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("accepts the token that matches the shared key", () => {
      expect(authenticate("f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3")).toBe(
        true,
      );
    });

    it("rejects any token that does not match the shared key", () => {
      expect(authenticate("wrong-token")).toBe(false);
      expect(authenticate("")).toBe(false);
    });
  });
});
