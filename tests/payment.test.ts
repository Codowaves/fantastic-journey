import { describe, it, expect } from "vitest";
import { applyDiscount } from "../src/payment";

describe("applyDiscount", () => {
  it("returns full price when percentOff is 0", () => {
    const result = applyDiscount({ amount: 10, currency: "USD" }, 0);
    expect(result).toEqual({ amount: 10, currency: "USD" });
  });

  it("applies 100% discount correctly", () => {
    const result = applyDiscount({ amount: 10, currency: "USD" }, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("applies 50% discount correctly", () => {
    const result = applyDiscount({ amount: 10, currency: "USD" }, 50);
    expect(result).toEqual({ amount: 5, currency: "USD" });
  });

  it("throws RangeError for percentOff > 100", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(RangeError);
  });

  it("throws RangeError for negative percentOff", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(RangeError);
  });
});