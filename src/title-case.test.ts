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

  it("capitalizes a single character", () => {
    expect(titleCase("a")).toBe("A");
  });

  it("handles a single space only", () => {
    expect(titleCase(" ")).toBe(" ");
  });

  it("handles multiple spaces only", () => {
    expect(titleCase("   ")).toBe("   ");
  });

  it("handles leading and trailing spaces", () => {
    expect(titleCase(" hello world ")).toBe(" Hello World ");
  });

  it("lowercases the rest of the word after the first character", () => {
    expect(titleCase("hELLO wORLD")).toBe("HELLO WORLD");
  });

  it("handles mixed case input", () => {
    expect(titleCase("jAVASCRIPT tYPeScript")).toBe("JAVASCRIPT TYPeScript");
  });

  it("capitalizes words separated by other whitespace (tabs)", () => {
    expect(titleCase("hello\tworld")).toBe("Hello\tworld");
  });

  it("handles non-letter first characters unchanged", () => {
    expect(titleCase("1apple 2banana")).toBe("1apple 2banana");
  });

  it("handles unicode letters", () => {
    expect(titleCase("über café")).toBe("Über Café");
  });

  it("preserves punctuation between words", () => {
    expect(titleCase("hello-world foo bar")).toBe("Hello-world Foo Bar");
  });
});
