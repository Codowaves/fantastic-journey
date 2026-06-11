import { describe, it, expect } from "vitest";
import { isPalindrome } from "./palindrome";

describe("isPalindrome", () => {
  it("should return true for simple palindromes", () => {
    expect(isPalindrome("racecar")).toBe(true);
    expect(isPalindrome("noon")).toBe(true);
  });

  it("should return false for non-palindromes", () => {
    expect(isPalindrome("hello")).toBe(false);
    expect(isPalindrome("world")).toBe(false);
  });

  it("should handle mixed case and punctuation", () => {
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
    expect(isPalindrome("Was it a car or a cat I saw?")).toBe(true);
  });

  it("should return true for empty string", () => {
    expect(isPalindrome("")).toBe(true);
  });

  it("should return true for single character", () => {
    expect(isPalindrome("a")).toBe(true);
    expect(isPalindrome("Z")).toBe(true);
  });

  it("should handle numeric strings", () => {
    expect(isPalindrome("12321")).toBe(true);
    expect(isPalindrome("123")).toBe(false);
  });
});
