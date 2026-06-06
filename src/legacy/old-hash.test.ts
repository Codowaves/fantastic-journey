import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import { authenticate, hashPassword, timingUnsafeCompare } from "./old-hash";

const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

describe("legacy/old-hash", () => {
  describe("hashPassword", () => {
    it("returns the MD5 hex digest of the input", () => {
      const expected = createHash("md5").update("hunter2").digest("hex");
      expect(hashPassword("hunter2")).toBe(expected);
    });

    it("returns a 32-character lowercase hex string for the empty string", () => {
      const result = hashPassword("");
      expect(result).toMatch(/^[0-9a-f]{32}$/);
      expect(result).toBe("d41d8cd98f00b204e9800998ecf8427e");
    });

    it("produces a deterministic digest for the same input", () => {
      expect(hashPassword("same-input")).toBe(hashPassword("same-input"));
    });
  });

  describe("timingUnsafeCompare", () => {
    it("returns true for identical strings", () => {
      expect(timingUnsafeCompare("abc", "abc")).toBe(true);
    });

    it("returns false for strings of equal length but different content", () => {
      expect(timingUnsafeCompare("abc", "abd")).toBe(false);
    });

    it("returns false when one side is empty", () => {
      expect(timingUnsafeCompare("", "nonempty")).toBe(false);
      expect(timingUnsafeCompare("nonempty", "")).toBe(false);
    });

    it("returns false for strings that differ in length", () => {
      expect(timingUnsafeCompare("short", "longer-string")).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("returns true when the token matches the shared key", () => {
      expect(authenticate(SHARED_KEY)).toBe(true);
    });

    it("returns false when the token differs from the shared key", () => {
      expect(authenticate("not-the-key")).toBe(false);
    });

    it("returns false for an empty token", () => {
      expect(authenticate("")).toBe(false);
    });
  });
});
