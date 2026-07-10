import { describe, expect, it } from "vitest";

import { greeting } from "./greeting";

describe("greeting", () => {
  it("greets the given name", () => {
    expect(greeting("World")).toBe("Hello, World!");
  });

  it("handles an empty string by returning the base greeting", () => {
    expect(greeting("")).toBe("Hello, !");
  });

  it("handles a single character name", () => {
    expect(greeting("A")).toBe("Hello, A!");
  });

  it("preserves whitespace-only names", () => {
    expect(greeting("   ")).toBe("Hello,    !");
  });

  it("preserves names with surrounding whitespace", () => {
    expect(greeting("  Alice  ")).toBe("Hello,   Alice  !");
  });

  it("preserves names containing numbers", () => {
    expect(greeting("User42")).toBe("Hello, User42!");
  });

  it("preserves unicode characters", () => {
    expect(greeting("Élise")).toBe("Hello, Élise!");
    expect(greeting("名前")).toBe("Hello, 名前!");
  });

  it("preserves special characters and punctuation", () => {
    expect(greeting("O'Brien")).toBe("Hello, O'Brien!");
    expect(greeting("a-b_c.d")).toBe("Hello, a-b_c.d!");
  });

  it("handles a very long name", () => {
    const longName = "a".repeat(10_000);
    const result = greeting(longName);
    expect(result.startsWith("Hello, ")).toBe(true);
    expect(result.endsWith("!")).toBe(true);
    expect(result).toBe(`Hello, ${longName}!`);
  });

  it("coerces a non-string numeric input", () => {
    expect(greeting(42 as unknown as string)).toBe("Hello, 42!");
  });

  it("coerces an undefined input to the string 'undefined'", () => {
    expect(greeting(undefined as unknown as string)).toBe("Hello, undefined!");
  });

  it("coerces a null input to the string 'null'", () => {
    expect(greeting(null as unknown as string)).toBe("Hello, null!");
  });

  describe("error/throw paths", () => {
    it("does not throw on an empty string", () => {
      expect(() => greeting("")).not.toThrow();
    });

    it("does not throw on undefined input", () => {
      expect(() => greeting(undefined as unknown as string)).not.toThrow();
    });

    it("does not throw on null input", () => {
      expect(() => greeting(null as unknown as string)).not.toThrow();
    });

    it("does not throw on a numeric input", () => {
      expect(() => greeting(42 as unknown as string)).not.toThrow();
    });

    it("does not throw on an object input via coercion", () => {
      expect(() =>
        greeting({ toString: () => "obj" } as unknown as string),
      ).not.toThrow();
    });

    it("throws a TypeError when given a Symbol value (no implicit string conversion)", () => {
      // Template-literal coercion of a Symbol throws in every JS engine;
      // the test pins this documented error path so future refactors don't
      // accidentally hide the failure with a wrapping try/catch.
      expect(() => greeting(Symbol("name") as unknown as string)).toThrow(
        TypeError,
      );
    });
  });
});
