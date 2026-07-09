import { describe, it, expect } from "vitest";

import { isAnagram } from "./seed-anagram";

describe("isAnagram", () => {
  it("returns true for anagrams", () => {
    expect(isAnagram("listen", "silent")).toBe(true);
  });

  it("returns false for non-anagrams", () => {
    expect(isAnagram("a", "b")).toBe(false);
  });

  it("returns true for empty strings", () => {
    expect(isAnagram("", "")).toBe(true);
  });

  it("returns false when lengths differ", () => {
    expect(isAnagram("abc", "abcd")).toBe(false);
  });

  it("returns false when same length but different character counts", () => {
    expect(isAnagram("aab", "abb")).toBe(false);
  });

  it("throws TypeError when first argument is not a string", () => {
    expect(() => isAnagram(123 as unknown as string, "abc")).toThrow(TypeError);
  });

  it("throws TypeError when second argument is not a string", () => {
    expect(() => isAnagram("abc", null as unknown as string)).toThrow(
      TypeError,
    );
  });

  it("throws when first argument is undefined", () => {
    expect(() => isAnagram(undefined as unknown as string, "abc")).toThrow(
      TypeError,
    );
  });

  it("throws when second argument is an object", () => {
    expect(() => isAnagram("abc", {} as unknown as string)).toThrow(TypeError);
  });

  it("handles repeated characters", () => {
    expect(isAnagram("aabbcc", "abcabc")).toBe(true);
  });
});
