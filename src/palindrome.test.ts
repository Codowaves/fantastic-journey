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

  describe("normalization empties (pure-non-alphanumeric inputs)", () => {
    it("treats a string of only punctuation as a palindrome (normalized empty)", () => {
      // After `[^a-z0-9]` strips everything, the normalized form is "" — and
      // an empty string reads the same forwards and backwards, so true.
      expect(isPalindrome("!!!")).toBe(true);
    });

    it("treats a string of only spaces as a palindrome (normalized empty)", () => {
      expect(isPalindrome("   ")).toBe(true);
    });

    it("treats a mix of punctuation and spaces as a palindrome (normalized empty)", () => {
      expect(isPalindrome("! ? . , ; :")).toBe(true);
    });

    it("treats a string of only symbols as a palindrome", () => {
      expect(isPalindrome("@#$%^&*()_+-=")).toBe(true);
    });
  });

  describe("non-throwing guarantees on unusual but valid inputs", () => {
    it("does not throw on a string with tabs and newlines", () => {
      expect(() => isPalindrome("a\tb\tb\ta")).not.toThrow();
    });

    it("handles tabs and newlines symmetrically as a palindrome", () => {
      expect(isPalindrome("a\nb\tb\na")).toBe(true);
    });

    it("does not throw on numeric-only strings of arbitrary length", () => {
      const longNumeric = "1".repeat(1000);
      expect(() => isPalindrome(longNumeric)).not.toThrow();
    });

    it("returns true for a 1000-character palindrome of 9s", () => {
      const longPalindrome = "9".repeat(1000);
      expect(isPalindrome(longPalindrome)).toBe(true);
    });

    it("does not throw on Unicode emoji (filtered out by normalization)", () => {
      expect(() => isPalindrome("a😀a")).not.toThrow();
    });

    it("treats emoji-only strings as a palindrome (normalized empty)", () => {
      // Emoji are stripped by `[^a-z0-9]` so the normalized form is "".
      expect(isPalindrome("😀😀")).toBe(true);
      expect(isPalindrome("😀🦀😀")).toBe(true);
    });

    it("handles accented latin characters as non-alphanumeric (stripped)", () => {
      // The regex only keeps a–z (case-insensitive) and 0–9; accented chars
      // are removed by normalization. The remaining ASCII is what gets compared.
      expect(isPalindrome("ábábá")).toBe(true);
      expect(() => isPalindrome("café")).not.toThrow();
    });
  });

  describe("case-only mirrors (normalization erases case differences)", () => {
    it("returns true when reversing the case of a palindrome", () => {
      // Reversed case is not a palindrome on its own, but after toLowerCase
      // both sides collapse to the same string.
      expect(isPalindrome("AaA")).toBe(true);
    });

    it("returns true for alternating-case palindromes", () => {
      expect(isPalindrome("R-a-c-e-c-a-r".replace(/-/g, ""))).toBe(true);
      expect(isPalindrome("NoOn")).toBe(true);
    });
  });

  describe("mixed alphanumeric non-palindromes", () => {
    it("returns false for a palindrome-punctuation non-palindrome", () => {
      // After stripping punctuation, "1a2" is not a palindrome ("1a2" vs "2a1").
      expect(isPalindrome("1a2")).toBe(false);
    });

    it("returns false for digits mixed with reversed letters", () => {
      expect(isPalindrome("1a2b")).toBe(false);
    });

    it("returns false for a near-palindrome that differs by one character", () => {
      // "racekcar" — an extra 'k' two-from-the-center breaks symmetry.
      expect(isPalindrome("racekcar")).toBe(false);
    });
  });
});
