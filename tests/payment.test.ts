import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "../src/payment";

describe("applyDiscount", () => {
  it("applies no discount", () => {
    expect(applyDiscount({ amount: 100, currency: "USD" }, 0)).toEqual({
      amount: 100,
      currency: "USD",
    });
  });

  it("applies 50% discount", () => {
    expect(applyDiscount({ amount: 100, currency: "USD" }, 50)).toEqual({
      amount: 50,
      currency: "USD",
    });
  });

  it("rounds half-up", () => {
    expect(applyDiscount({ amount: 99, currency: "USD" }, 33)).toEqual({
      amount: 66.33,
      currency: "USD",
    });
  });

  it("throws for negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(
      RangeError
    );
  });

  it("throws for percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(
      RangeError
    );
  });
});

describe("totalWithTax", () => {
  it("returns zero amount for empty array", () => {
    expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
  });

  it("handles single item", () => {
    expect(
      totalWithTax([{ amount: 100, currency: "USD" }], 0.1)
    ).toEqual({ amount: 110, currency: "USD" });
  });

  it("sums multiple items with tax", () => {
    expect(
      totalWithTax(
        [
          { amount: 50, currency: "USD" },
          { amount: 50, currency: "USD" },
        ],
        0.1
      )
    ).toEqual({ amount: 110, currency: "USD" });
  });

  it("rounds to two decimal places", () => {
    expect(
      totalWithTax([{ amount: 33.33, currency: "USD" }], 0.1)
    ).toEqual({ amount: 36.66, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  it("returns true for recent order", () => {
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent)).toBe(true);
  });

  it("returns false for order outside window", () => {
    const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old)).toBe(false);
  });

  it("returns true at one second inside boundary", () => {
    const boundary = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1000);
    expect(isRefundEligible(boundary)).toBe(true);
  });

  it("respects custom return window", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old, 90)).toBe(true);
  });
});
