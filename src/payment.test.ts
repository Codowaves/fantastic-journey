import { describe, it, expect } from "vitest";
import { totalWithTax } from "./payment";

describe("totalWithTax", () => {
  it("returns zero with USD currency for empty list", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("sums items and applies tax for single currency", () => {
    const items = [
      { amount: 10, currency: "USD" },
      { amount: 20, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 33, currency: "USD" });
  });

  it("throws RangeError for mixed currencies", () => {
    const items = [
      { amount: 10, currency: "USD" },
      { amount: 10, currency: "EUR" },
    ];
    expect(() => totalWithTax(items, 0.1)).toThrow(RangeError);
  });

  it("throws RangeError when first item currency differs from later items", () => {
    const items = [
      { amount: 10, currency: "EUR" },
      { amount: 10, currency: "USD" },
    ];
    expect(() => totalWithTax(items, 0.1)).toThrow(RangeError);
  });
});