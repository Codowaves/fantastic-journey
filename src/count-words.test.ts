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

  it("returns 1 for a single word with no whitespace", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("treats tabs and newlines as whitespace separators", () => {
    expect(countWords("one\ttwo\nthree")).toBe(3);
  });

  it("returns 0 for a string containing only tabs and newlines", () => {
    expect(countWords("\t\n\t\n")).toBe(0);
  });

  it("counts words in a multi-line string", () => {
    expect(countWords("line one\nline two\nline three")).toBe(6);
  });

  it("handles mixed whitespace runs including tabs and newlines", () => {
    expect(countWords("  one \t\n two   \t three  ")).toBe(3);
  });

  it("counts unicode words", () => {
    expect(countWords("café résumé naïve")).toBe(3);
  });

  it("does not split on punctuation or hyphens", () => {
    expect(countWords("well-known, isn't it?")).toBe(3);
  });

  it("counts numeric tokens as words", () => {
    expect(countWords("123 4567 89")).toBe(3);
  });
});
