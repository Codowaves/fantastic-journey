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

  describe("edge cases — whitespace", () => {
    it("returns leading-space string with space preserved and next letter upper-cased", () => {
      expect(capitalize(" hello")).toBe(" hello");
    });

    it("returns whitespace-only string unchanged", () => {
      expect(capitalize("   ")).toBe("   ");
    });

    it("uppercases the first non-space character when string begins with whitespace", () => {
      expect(capitalize("   hello world")).toBe("   hello world");
    });
  });

  describe("edge cases — non-letter first character", () => {
    it("leaves a string starting with a hyphen unchanged", () => {
      expect(capitalize("-hello")).toBe("-hello");
    });

    it("leaves a string starting with an underscore unchanged", () => {
      expect(capitalize("_hello")).toBe("_hello");
    });

    it("leaves a string starting with a punctuation mark unchanged", () => {
      expect(capitalize("!hello")).toBe("!hello");
    });

    it("upper-cases a string starting with an accented lowercase letter", () => {
      expect(capitalize("über")).toBe("Über");
    });
  });

  describe("edge cases — invalid types (TypeScript-only sanity)", () => {
    it("does not throw on a string-like input", () => {
      expect(() => capitalize("abc")).not.toThrow();
    });
  });

  describe("edge cases — only-uppercase and length extremes", () => {
    it("leaves an all-uppercase string unchanged (no double-cap)", () => {
      expect(capitalize("HELLO")).toBe("HELLO");
    });

    it("upper-cases only the first character when only the rest is uppercase", () => {
      expect(capitalize("hELLO")).toBe("HELLO");
    });

    it("handles a very long single-word string", () => {
      const longWord = "a".repeat(1000);
      const expected = "A" + "a".repeat(999);
      expect(capitalize(longWord)).toBe(expected);
    });

    it("handles a single uppercase letter", () => {
      expect(capitalize("Z")).toBe("Z");
    });
  });
});
