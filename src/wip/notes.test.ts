import { describe, it, expect } from "vitest";
import { calculateTotal, legacyParse } from "./notes.js";

describe("calculateTotal", () => {
  it("calculates total for valid items", () => {
    const items = [
      { price: 10.5, qty: 2 },
      { price: 5.25, qty: 3 },
    ];
    const result = calculateTotal(items);
    expect(result).toBe(36.75);
  });

  it("returns 0 for empty array", () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });

  it("handles negative quantities", () => {
    const items = [{ price: 10, qty: -2 }];
    const result = calculateTotal(items);
    expect(result).toBe(-20);
  });

  it("handles zero price", () => {
    const items = [{ price: 0, qty: 5 }];
    const result = calculateTotal(items);
    expect(result).toBe(0);
  });

  it("handles zero quantity", () => {
    const items = [{ price: 10, qty: 0 }];
    const result = calculateTotal(items);
    expect(result).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const items = [{ price: 10.333, qty: 1 }];
    const result = calculateTotal(items);
    expect(result).toBe(10.33);
  });

  it("handles multiple items with rounding", () => {
    const items = [
      { price: 1.111, qty: 1 },
      { price: 2.222, qty: 2 },
    ];
    const result = calculateTotal(items);
    expect(result).toBe(5.56);
  });
});

describe("legacyParse", () => {
  it("parses valid JSON string", () => {
    const result = legacyParse('{"key": "value"}');
    expect(result).toEqual({ key: "value" });
  });

  it("parses JSON array", () => {
    const result = legacyParse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it("parses JSON primitives", () => {
    expect(legacyParse("42")).toBe(42);
    expect(legacyParse('"hello"')).toBe("hello");
    expect(legacyParse("true")).toBe(true);
    expect(legacyParse("null")).toBe(null);
  });

  it("throws on invalid JSON", () => {
    expect(() => legacyParse("invalid json")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => legacyParse("")).toThrow();
  });

  it("throws on malformed JSON", () => {
    expect(() => legacyParse('{"key": value}')).toThrow();
  });
});
