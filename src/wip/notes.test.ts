import { describe, expect, test } from "vitest";
import { calculateTotal, legacyParse } from "./notes";

describe("calculateTotal", () => {
  test("happy path: calculates total for multiple items", () => {
    const items = [
      { price: 10.0, qty: 2 },
      { price: 5.5, qty: 3 },
    ];
    expect(calculateTotal(items)).toBe(36.5);
  });

  test("edge case: empty array returns zero", () => {
    expect(calculateTotal([])).toBe(0);
  });

  test("edge case: single item", () => {
    expect(calculateTotal([{ price: 7.99, qty: 1 }])).toBe(7.99);
  });
});

describe("legacyParse", () => {
  test("happy path: parses valid JSON string", () => {
    expect(legacyParse('{"key":"value"}')).toEqual({ key: "value" });
  });

  test("happy path: parses JSON array", () => {
    expect(legacyParse("[1,2,3]")).toEqual([1, 2, 3]);
  });

  test("edge case: invalid JSON throws", () => {
    expect(() => legacyParse("not json")).toThrow();
  });
});
