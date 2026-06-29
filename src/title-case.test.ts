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
});
