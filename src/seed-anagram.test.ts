import { describe, it, expect } from "vitest";
import { isAnagram } from "./seed-anagram";

describe("isAnagram", () => {
  it("returns true for two anagrams", () => {
    expect(isAnagram("listen", "silent")).toBe(true);
  });

  it("returns false for two non-anagrams", () => {
    expect(isAnagram("a", "b")).toBe(false);
  });

  it("returns false when lengths differ (early-exit branch)", () => {
    expect(isAnagram("abc", "abcd")).toBe(false);
    expect(isAnagram("abcd", "abc")).toBe(false);
  });

  it("returns false when b contains a character not present in a", () => {
    expect(isAnagram("aabb", "aabc")).toBe(false);
  });

  it("returns true for identical strings", () => {
    expect(isAnagram("abc", "abc")).toBe(true);
  });

  it("returns true for two empty strings", () => {
    expect(isAnagram("", "")).toBe(true);
  });

  it("returns false when one string is empty and the other is not", () => {
    expect(isAnagram("", "a")).toBe(false);
    expect(isAnagram("a", "")).toBe(false);
  });

  it("is case-sensitive (treats uppercase and lowercase as distinct)", () => {
    expect(isAnagram("a", "A")).toBe(false);
    expect(isAnagram("Ab", "aB")).toBe(false);
  });
});
