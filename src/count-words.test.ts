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

  it("counts a single word with no surrounding whitespace", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("handles tabs and newlines as whitespace", () => {
    expect(countWords("a\tb\nc")).toBe(3);
  });

  it("handles mixed whitespace runs including tabs and newlines", () => {
    expect(countWords("  a \t b \n\n  c  ")).toBe(3);
  });

  it("returns 0 for a string containing only tabs and newlines", () => {
    expect(countWords("\t\n  \t\r\n")).toBe(0);
  });

  it("counts words with punctuation attached", () => {
    expect(countWords("hello, world!")).toBe(2);
  });
});
