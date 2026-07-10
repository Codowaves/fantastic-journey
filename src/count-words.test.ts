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

  it("handles tabs and newlines as whitespace separators", () => {
    expect(countWords("one\ttwo\nthree")).toBe(3);
  });

  it("handles a mix of spaces, tabs, and newlines between words", () => {
    expect(countWords("a \t b\nc  \td")).toBe(4);
  });

  it("returns 1 for a single word with no whitespace", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("counts a single non-space word surrounded by whitespace", () => {
    expect(countWords("  \tworld\n  ")).toBe(1);
  });

  it("counts words containing unicode characters", () => {
    expect(countWords("café résumé naïve")).toBe(3);
  });

  it("counts a single emoji as a word", () => {
    expect(countWords("hello 🚀 world")).toBe(3);
  });

  it("returns 0 for a string of only tabs and newlines", () => {
    expect(countWords("\t\n  \n\t")).toBe(0);
  });
});
