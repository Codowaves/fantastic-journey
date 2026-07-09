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

  it("treats newlines as whitespace separators", () => {
    expect(countWords("hello\nworld")).toBe(2);
  });

  it("treats tabs as whitespace separators", () => {
    expect(countWords("hello\tworld")).toBe(2);
  });

  it("handles mixed newline, tab, and space separators", () => {
    expect(countWords("a\nb\tc d")).toBe(4);
  });

  it("returns 1 for a single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("counts words with attached punctuation", () => {
    expect(countWords("hello, world!")).toBe(2);
  });

  it("returns 1 for a single non-ASCII word", () => {
    expect(countWords("café")).toBe(1);
  });

  it("counts multiple non-ASCII words", () => {
    expect(countWords("café résumé naïve")).toBe(3);
  });
});
