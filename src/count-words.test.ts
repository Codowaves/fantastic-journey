import { describe, expect, it } from "vitest";

import { countWords } from "./count-words";

describe("countWords", () => {
  it("returns 0 for an empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for a whitespace-only string", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("counts words separated by single spaces", () => {
    expect(countWords("one two three")).toBe(3);
  });

  it("collapses runs of whitespace between words", () => {
    expect(countWords("a  b   c")).toBe(3);
  });

  it("handles leading and trailing whitespace", () => {
    expect(countWords("  hello world  ")).toBe(2);
  });

  describe("edge cases", () => {
    it("returns 0 for a string of only tabs", () => {
      expect(countWords("\t\t\t")).toBe(0);
    });

    it("returns 0 for a string of only newlines", () => {
      expect(countWords("\n\n")).toBe(0);
    });

    it("returns 0 for a string mixing tabs, newlines, and spaces", () => {
      expect(countWords("\t \n \t\n")).toBe(0);
    });

    it("counts tabs as whitespace separators", () => {
      expect(countWords("a\tb\tc")).toBe(3);
    });

    it("counts newlines as whitespace separators", () => {
      expect(countWords("a\nb\nc")).toBe(3);
    });

    it("handles tabs and spaces mixed together", () => {
      expect(countWords("a\tb c")).toBe(3);
    });

    it("counts a single word with no whitespace", () => {
      expect(countWords("hello")).toBe(1);
    });

    it("counts a single character as one word", () => {
      expect(countWords("x")).toBe(1);
    });
  });
});
