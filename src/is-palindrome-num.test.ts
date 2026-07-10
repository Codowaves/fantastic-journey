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

  it("returns false for Infinity and -Infinity", () => {
    expect(isPalindromeNum(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isPalindromeNum(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false for non-integer floats", () => {
    expect(isPalindromeNum(1.5)).toBe(false);
    expect(isPalindromeNum(3.14)).toBe(false);
  });

  it("handles integer-valued floats correctly", () => {
    expect(isPalindromeNum(121.0)).toBe(true);
    expect(isPalindromeNum(123.0)).toBe(false);
  });

  it("returns false for non-palindromic non-number types", () => {
    expect(isPalindromeNum("hello" as unknown as number)).toBe(false);
  });
});
