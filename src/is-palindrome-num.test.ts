import { describe, expect, it } from "vitest";

import { isPalindromeNum } from "./is-palindrome-num";

describe("isPalindromeNum", () => {
  it("returns true for single-digit numbers", () => {
    expect(isPalindromeNum(0)).toBe(true);
    expect(isPalindromeNum(5)).toBe(true);
    expect(isPalindromeNum(9)).toBe(true);
  });

  it("returns true for multi-digit palindromes", () => {
    expect(isPalindromeNum(121)).toBe(true);
    expect(isPalindromeNum(12321)).toBe(true);
    expect(isPalindromeNum(9889)).toBe(true);
  });

  it("returns false for non-palindromes", () => {
    expect(isPalindromeNum(123)).toBe(false);
    expect(isPalindromeNum(-121)).toBe(false);
    expect(isPalindromeNum(10)).toBe(false);
  });

  it("returns false for negative numbers", () => {
    expect(isPalindromeNum(-1)).toBe(false);
    expect(isPalindromeNum(-121)).toBe(false);
  });

  it("returns false for null or undefined", () => {
    expect(isPalindromeNum(null as unknown as number)).toBe(false);
    expect(isPalindromeNum(undefined as unknown as number)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isPalindromeNum(Number.NaN)).toBe(false);
  });

  describe("null / undefined guard (first validation branch)", () => {
    it("returns false for null", () => {
      expect(isPalindromeNum(null as unknown as number)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isPalindromeNum(undefined as unknown as number)).toBe(false);
    });

    it("uses loose equality so both null and undefined hit the same branch", () => {
      // The guard is `n == null` (loose equality), so undefined is caught here too.
      expect(isPalindromeNum(null as unknown as number)).toBe(false);
      expect(isPalindromeNum(undefined as unknown as number)).toBe(false);
    });
  });

  describe("NaN guard (shared with null/undefined via short-circuit)", () => {
    it("returns false for Number.NaN", () => {
      expect(isPalindromeNum(Number.NaN)).toBe(false);
    });

    it("returns false for NaN produced via 0/0", () => {
      expect(isPalindromeNum(0 / 0)).toBe(false);
    });

    it("returns false for NaN produced via Number('abc')", () => {
      expect(isPalindromeNum(Number("abc"))).toBe(false);
    });
  });

  describe("negative-number branch", () => {
    it("returns false for -1", () => {
      expect(isPalindromeNum(-1)).toBe(false);
    });

    it("returns false for the negative form of a positive palindrome", () => {
      expect(isPalindromeNum(-121)).toBe(false);
      expect(isPalindromeNum(-12321)).toBe(false);
    });

    it("returns false for negative single-digit numbers", () => {
      expect(isPalindromeNum(-5)).toBe(false);
    });

    it("returns false for Number.NEGATIVE_INFINITY", () => {
      // -Infinity is < 0, so it falls into the negative branch (and String(-Infinity)
      // would not equal its reverse, but the guard returns first).
      expect(isPalindromeNum(-Infinity)).toBe(false);
    });
  });

  describe("non-integer / non-finite inputs", () => {
    it("returns false for floating-point numbers (not strict integer palindrome)", () => {
      // 1.5 -> "1.5", reverse "5.1" — not equal.
      expect(isPalindromeNum(1.5)).toBe(false);
    });

    it("returns false for Number.POSITIVE_INFINITY", () => {
      expect(isPalindromeNum(Number.POSITIVE_INFINITY)).toBe(false);
    });

    it("returns true for -0 (-0 is not strictly less than 0, so digit-reverse path runs)", () => {
      // -0 < 0 is false, so the negative-number branch is skipped. String(-0) === "0",
      // which reverses to itself — same outcome as +0.
      expect(isPalindromeNum(-0)).toBe(true);
    });

    it("returns true for +0 (zero is a palindrome)", () => {
      expect(isPalindromeNum(0)).toBe(true);
    });
  });

  describe("does-not-throw contract", () => {
    it("does not throw for null", () => {
      expect(() => isPalindromeNum(null as unknown as number)).not.toThrow();
    });

    it("does not throw for undefined", () => {
      expect(() =>
        isPalindromeNum(undefined as unknown as number),
      ).not.toThrow();
    });

    it("does not throw for NaN", () => {
      expect(() => isPalindromeNum(Number.NaN)).not.toThrow();
    });

    it("does not throw for negative numbers", () => {
      expect(() => isPalindromeNum(-121)).not.toThrow();
    });

    it("does not throw for Infinity", () => {
      expect(() => isPalindromeNum(Number.POSITIVE_INFINITY)).not.toThrow();
      expect(() => isPalindromeNum(Number.NEGATIVE_INFINITY)).not.toThrow();
    });
  });
});
