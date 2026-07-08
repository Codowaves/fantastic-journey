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

  it("leaves rest of string case unchanged (mixed case tail)", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("handles leading whitespace without capitalizing past it", () => {
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("handles string of only whitespace", () => {
    expect(capitalize("   ")).toBe("   ");
  });

  it("handles string starting with a symbol", () => {
    expect(capitalize("-foo")).toBe("-foo");
  });

  it("handles string starting with a punctuation mark", () => {
    expect(capitalize("!hello")).toBe("!hello");
  });

  it("handles string starting with a unicode letter (emoji is two code units)", () => {
    expect(capitalize("ñandú")).toBe("Ñandú");
  });

  it("handles long string without breaking tail characters", () => {
    const long = "a".repeat(1000);
    expect(capitalize(long)).toBe("A" + "a".repeat(999));
  });

  it("handles string starting with a newline character", () => {
    expect(capitalize("\nfoo")).toBe("\nfoo");
  });
});
