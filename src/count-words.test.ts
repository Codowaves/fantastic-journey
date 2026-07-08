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

  it("returns 0 for tabs and newlines only", () => {
    expect(countWords("\t\n\t")).toBe(0);
  });

  it("returns 0 for mixed whitespace-only characters", () => {
    expect(countWords(" \t\n\r ")).toBe(0);
  });

  it("counts a single word without throwing", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("handles tabs and newlines as whitespace separators", () => {
    expect(countWords("a\tb\nc")).toBe(3);
  });

  it("does not throw on a single character", () => {
    expect(() => countWords("a")).not.toThrow();
  });

  it("does not throw on whitespace-only input", () => {
    expect(() => countWords("   ")).not.toThrow();
  });

  it("does not throw on an empty string", () => {
    expect(() => countWords("")).not.toThrow();
  });
});
