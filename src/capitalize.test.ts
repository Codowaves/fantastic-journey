import { describe, it, expect } from "vitest";
import { capitalize } from "./capitalize";

describe("capitalize", () => {
  it("capitalizes a normal word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("leaves already capitalized string unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("handles string starting with a digit", () => {
    expect(capitalize("9lives")).toBe("9lives");
  });

  it("only capitalizes first character, leaves rest untouched", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("handles string starting with whitespace", () => {
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("handles uppercase first character", () => {
    expect(capitalize("ABC")).toBe("ABC");
  });

  it("does not mutate the input string", () => {
    const input = "hello";
    capitalize(input);
    expect(input).toBe("hello");
  });
});
