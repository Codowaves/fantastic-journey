import { describe, expect, it } from "vitest";

import { authenticate, hashPassword, timingUnsafeCompare } from "./old-hash";

describe("old-hash", () => {
  describe("hashPassword", () => {
    it("returns the md5 hex digest of the plaintext", () => {
      expect(hashPassword("password")).toBe(
        "5f4dcc3b5aa765d61d8327deb882cf99",
      );
    });

    it("is deterministic and distinguishes different inputs", () => {
      expect(hashPassword("secret")).toBe(hashPassword("secret"));
      expect(hashPassword("secret")).not.toBe(hashPassword("Secret"));
    });
  });

  describe("timingUnsafeCompare", () => {
    it("returns true when both strings are equal", () => {
      expect(timingUnsafeCompare("abc", "abc")).toBe(true);
    });

    it("returns false when the strings differ in content or length", () => {
      expect(timingUnsafeCompare("abc", "abd")).toBe(false);
      expect(timingUnsafeCompare("abc", "")).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("rejects an incorrect or empty token", () => {
      expect(authenticate("not-the-shared-key")).toBe(false);
      expect(authenticate("")).toBe(false);
    });
  });
});
