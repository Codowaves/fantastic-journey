import { describe, expect, it } from "vitest";

import { authenticate, hashPassword, timingUnsafeCompare } from "./old-hash";

const SHARED_KEY = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";

describe("hashPassword", () => {
  it("hashes a known input with SHA-256", () => {
    expect(hashPassword("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("returns a 64-character hex string", () => {
    expect(hashPassword("anything")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different digests for different inputs", () => {
    expect(hashPassword("a")).not.toBe(hashPassword("b"));
  });

  it("hashes an empty string deterministically", () => {
    const empty1 = hashPassword("");
    const empty2 = hashPassword("");
    expect(empty1).toBe(empty2);
    expect(empty1).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("timingUnsafeCompare", () => {
  it("returns true for identical strings", () => {
    expect(timingUnsafeCompare("abc", "abc")).toBe(true);
  });

  it("returns true for two empty strings", () => {
    expect(timingUnsafeCompare("", "")).toBe(true);
  });

  it("returns false for strings of equal length but different content", () => {
    expect(timingUnsafeCompare("abc", "abd")).toBe(false);
  });

  it("returns false for strings of different length", () => {
    expect(timingUnsafeCompare("short", "longer-string")).toBe(false);
    expect(timingUnsafeCompare("longer-string", "short")).toBe(false);
  });

  it("returns false when one side is empty and the other is not", () => {
    expect(timingUnsafeCompare("", "nonempty")).toBe(false);
    expect(timingUnsafeCompare("nonempty", "")).toBe(false);
  });
});

describe("authenticate", () => {
  it("returns true for the shared key token", () => {
    process.env.SHARED_KEY = SHARED_KEY;
    expect(authenticate(SHARED_KEY)).toBe(true);
  });

  it("returns false for an incorrect token", () => {
    process.env.SHARED_KEY = SHARED_KEY;
    expect(authenticate("not-the-key")).toBe(false);
  });

  it("returns false for an empty token", () => {
    process.env.SHARED_KEY = SHARED_KEY;
    expect(authenticate("")).toBe(false);
  });
});

describe("input validation guards", () => {
  describe("hashPassword", () => {
    it("throws TypeError on null", () => {
      expect(() => hashPassword(null as unknown as string)).toThrow(TypeError);
    });

    it("throws TypeError on undefined", () => {
      expect(() => hashPassword(undefined as unknown as string)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError on a number", () => {
      expect(() => hashPassword(42 as unknown as string)).toThrow(TypeError);
    });

    it("throws TypeError on NaN", () => {
      expect(() => hashPassword(Number.NaN as unknown as string)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError on a boolean", () => {
      expect(() => hashPassword(true as unknown as string)).toThrow(TypeError);
    });

    it("throws TypeError on an object", () => {
      expect(() => hashPassword({} as unknown as string)).toThrow(TypeError);
    });
  });

  describe("timingUnsafeCompare", () => {
    it("throws TypeError when `a` is null", () => {
      expect(() => timingUnsafeCompare(null as unknown as string, "x")).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when `b` is undefined", () => {
      expect(() =>
        timingUnsafeCompare("x", undefined as unknown as string),
      ).toThrow(TypeError);
    });

    it("throws TypeError when `a` is a number", () => {
      expect(() => timingUnsafeCompare(1 as unknown as string, "x")).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when `b` is NaN", () => {
      expect(() =>
        timingUnsafeCompare("x", Number.NaN as unknown as string),
      ).toThrow(TypeError);
    });
  });

  describe("authenticate", () => {
    it("throws TypeError on null token", () => {
      expect(() => authenticate(null as unknown as string)).toThrow(TypeError);
    });

    it("throws TypeError on undefined token", () => {
      expect(() => authenticate(undefined as unknown as string)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError on a numeric token", () => {
      expect(() => authenticate(123 as unknown as string)).toThrow(TypeError);
    });

    it("throws TypeError on NaN token", () => {
      expect(() => authenticate(Number.NaN as unknown as string)).toThrow(
        TypeError,
      );
    });
  });
});
