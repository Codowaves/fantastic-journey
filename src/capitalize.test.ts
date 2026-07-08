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

  it("handles single uppercase character", () => {
    expect(capitalize("Z")).toBe("Z");
  });

  it("handles string with only whitespace", () => {
    expect(capitalize(" ")).toBe(" ");
  });

  it("handles string starting with whitespace", () => {
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("handles string with leading whitespace then text", () => {
    expect(capitalize("  hello")).toBe("  hello");
  });

  it("handles string with only special characters", () => {
    expect(capitalize("!@#$%")).toBe("!@#$%");
  });

  it("handles string starting with special character", () => {
    expect(capitalize("@hello")).toBe("@hello");
  });

  it("handles string starting with underscore", () => {
    expect(capitalize("_hello")).toBe("_hello");
  });

  it("handles string starting with newline", () => {
    expect(capitalize("\nhello")).toBe("\nhello");
  });

  it("handles string starting with tab", () => {
    expect(capitalize("\thello")).toBe("\thello");
  });

  it("handles string with all uppercase letters", () => {
    expect(capitalize("HELLO")).toBe("HELLO");
  });

  it("handles string with mixed case in middle", () => {
    expect(capitalize("hELLo WoRLd")).toBe("HELLo WoRLd");
  });

  it("handles string with unicode characters", () => {
    expect(capitalize("über")).toBe("Über");
  });

  it("handles string with emoji", () => {
    expect(capitalize("😀hello")).toBe("😀hello");
  });

  it("handles string starting with non-letter unicode", () => {
    expect(capitalize("ñandú")).toBe("Ñandú");
  });

  it("handles very long string", () => {
    const input = "a".repeat(10000);
    const expected = "A" + "a".repeat(9999);
    expect(capitalize(input)).toBe(expected);
  });
});
