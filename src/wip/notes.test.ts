import { describe, it, expect } from "vitest";
import { calculateTotal, legacyParse } from "./notes.js";

describe("calculateTotal", () => {
  it("calculates total for multiple items (happy path)", () => {
    const items = [
      { price: 10.5, qty: 2 },
      { price: 5.25, qty: 3 },
    ];
    const result = calculateTotal(items);
    expect(result).toBe(36.75); // (10.5 * 2) + (5.25 * 3) = 21 + 15.75
  });

  it("returns 0 for empty array (edge case)", () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });

  it("handles single item", () => {
    const items = [{ price: 100, qty: 1 }];
    const result = calculateTotal(items);
    expect(result).toBe(100);
  });

  it("handles negative quantity (edge case)", () => {
    const items = [{ price: 10, qty: -2 }];
    const result = calculateTotal(items);
    expect(result).toBe(-20);
  });

  it("handles zero quantity", () => {
    const items = [{ price: 10, qty: 0 }];
    const result = calculateTotal(items);
    expect(result).toBe(0);
  });

  it("rounds to 2 decimal places (edge case)", () => {
    const items = [{ price: 10.556, qty: 1 }];
    const result = calculateTotal(items);
    expect(result).toBe(10.56);
  });
});

describe("legacyParse", () => {
  it("parses valid JSON string (happy path)", () => {
    const input = '{"name":"test","value":123}';
    const result = legacyParse(input);
    expect(result).toEqual({ name: "test", value: 123 });
  });

  it("parses JSON array", () => {
    const input = "[1,2,3]";
    const result = legacyParse(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it("parses primitive values", () => {
    expect(legacyParse("42")).toBe(42);
    expect(legacyParse('"hello"')).toBe("hello");
    expect(legacyParse("true")).toBe(true);
    expect(legacyParse("null")).toBe(null);
  });

  it("throws on invalid JSON (edge case)", () => {
    const input = "{invalid json}";
    expect(() => legacyParse(input)).toThrow();
  });

  it("throws on empty string (edge case)", () => {
    expect(() => legacyParse("")).toThrow();
  });
});
