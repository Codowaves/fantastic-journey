import { describe, it, expect } from "vitest";
import { totalWithTax } from "./payment";

describe("totalWithTax", () => {
  it("returns empty list with zero USD", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("calculates total with tax for single currency items", () => {
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

  it("throws RangeError when second item differs in currency", () => {
    const items = [
      { amount: 10, currency: "USD" },
      { amount: 5, currency: "GBP" },
      { amount: 15, currency: "USD" },
    ];
    expect(() => totalWithTax(items, 0.1)).toThrow(RangeError);
  });
});