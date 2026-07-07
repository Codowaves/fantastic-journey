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
});
