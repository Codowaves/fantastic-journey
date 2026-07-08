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

  it("returns 0 for null", () => {
    expect(countWords(null as unknown as string)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(countWords(undefined as unknown as string)).toBe(0);
  });

  it("returns 0 for NaN", () => {
    expect(countWords(Number.NaN as unknown as string)).toBe(0);
  });
});
