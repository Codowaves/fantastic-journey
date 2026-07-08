import { describe, expect, it } from "vitest";

import { farewell } from "./farewell";

describe("farewell", () => {
  it("bids farewell to the given name", () => {
    expect(farewell("World")).toBe("Goodbye, World!");
  });

  it("handles an empty string by returning the base farewell", () => {
    expect(farewell("")).toBe("Goodbye, !");
  });

  it("handles a single character name", () => {
    expect(farewell("A")).toBe("Goodbye, A!");
  });

  it("preserves whitespace-only names", () => {
    expect(farewell("   ")).toBe("Goodbye,    !");
  });

  it("preserves names with surrounding whitespace", () => {
    expect(farewell("  Alice  ")).toBe("Goodbye,   Alice  !");
  });

  it("preserves names containing numbers", () => {
    expect(farewell("User42")).toBe("Goodbye, User42!");
  });

  it("preserves unicode characters", () => {
    expect(farewell("Élise")).toBe("Goodbye, Élise!");
    expect(farewell("名前")).toBe("Goodbye, 名前!");
  });

  it("preserves special characters and punctuation", () => {
    expect(farewell("O'Brien")).toBe("Goodbye, O'Brien!");
    expect(farewell("a-b_c.d")).toBe("Goodbye, a-b_c.d!");
  });

  it("handles a very long name", () => {
    const longName = "a".repeat(10_000);
    const result = farewell(longName);
    expect(result.startsWith("Goodbye, ")).toBe(true);
    expect(result.endsWith("!")).toBe(true);
    expect(result).toBe(`Goodbye, ${longName}!`);
  });

  it("coerces a non-string numeric input", () => {
    expect(farewell(42 as unknown as string)).toBe("Goodbye, 42!");
  });

  it("coerces an undefined input to the string 'undefined'", () => {
    expect(farewell(undefined as unknown as string)).toBe(
      "Goodbye, undefined!",
    );
  });

  it("coerces a null input to the string 'null'", () => {
    expect(farewell(null as unknown as string)).toBe("Goodbye, null!");
  });
});
