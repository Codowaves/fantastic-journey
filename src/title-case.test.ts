import { describe, it, expect } from "vitest";
import { titleCase } from "./title-case";

describe("titleCase", () => {
  it("capitalizes each word in a multi-word string", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("capitalizes a single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(titleCase("")).toBe("");
  });

  it("leaves already capitalized words unchanged", () => {
    expect(titleCase("Hello World")).toBe("Hello World");
  });

  it("handles multiple spaces between words", () => {
    expect(titleCase("hello  world")).toBe("Hello  World");
  });

  it("handles three or more words", () => {
    expect(titleCase("the quick brown fox")).toBe("The Quick Brown Fox");
  });

  // Edge case: single character
  it("capitalizes a single character", () => {
    expect(titleCase("a")).toBe("A");
  });

  // Edge case: already uppercase
  it("handles all-uppercase input", () => {
    expect(titleCase("HELLO WORLD")).toBe("HELLO WORLD");
  });

  // Edge case: mixed case
  it("handles mixed case input", () => {
    expect(titleCase("hELLo WoRLd")).toBe("HELLo WoRLd");
  });

  // Edge case: leading space
  it("handles leading space", () => {
    expect(titleCase(" hello world")).toBe(" Hello World");
  });

  // Edge case: trailing space
  it("handles trailing space", () => {
    expect(titleCase("hello world ")).toBe("Hello World ");
  });

  // Edge case: only spaces
  it("handles string with only spaces", () => {
    expect(titleCase("   ")).toBe("   ");
  });

  // Edge case: tab characters (not split by space)
  it("handles tab-separated words as a single token", () => {
    expect(titleCase("hello\tworld")).toBe("Hello\tworld");
  });

  // Edge case: numbers
  it("handles strings starting with numbers", () => {
    expect(titleCase("123abc def")).toBe("123abc Def");
  });

  // Edge case: special characters
  it("handles words with special characters", () => {
    expect(titleCase("hello-world foo")).toBe("Hello-world Foo");
  });

  // Edge case: punctuation
  it("handles words with punctuation", () => {
    expect(titleCase("hello, world!")).toBe("Hello, World!");
  });

  // Edge case: unicode characters
  it("handles unicode characters", () => {
    expect(titleCase("über Hello")).toBe("Über Hello");
  });

  // Edge case: very long string
  it("handles very long strings", () => {
    const input = "a".repeat(1000);
    const result = titleCase(input);
    expect(result).toBe("A" + "a".repeat(999));
  });

  // Edge case: many words
  it("handles many words", () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`);
    const input = words.join(" ");
    const expected = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    expect(titleCase(input)).toBe(expected);
  });
});
