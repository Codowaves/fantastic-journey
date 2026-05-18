import { describe, it, expect } from "vitest";
import { totalWithTax } from "./payment";

describe("totalWithTax", () => {
  it("returns 0 USD for empty list", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("sums items with matching currency", () => {
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

  it("throws RangeError with clear message on mixed currencies", () => {
    const items = [
      { amount: 10, currency: "USD" },
      { amount: 10, currency: "EUR" },
    ];
    expect(() => totalWithTax(items, 0.1)).toThrow("Mixed currencies detected: first item is USD, but encountered EUR");
  });
});