import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "../src/payment";

describe("applyDiscount", () => {
  it("applies no discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 0);
    expect(result.amount).toBe(100);
  });

  it("applies full discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 100);
    expect(result.amount).toBe(0);
  });

  it("applies 50% discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 50);
    expect(result.amount).toBe(50);
  });

  it("rounds to 2 decimal places", () => {
    const result = applyDiscount({ amount: 99, currency: "USD" }, 33);
    expect(result.amount).toBe(66.33);
  });

  it("throws for negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(RangeError);
  });

  it("throws for percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(RangeError);
  });

  it("preserves currency", () => {
    const result = applyDiscount({ amount: 100, currency: "EUR" }, 20);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("returns 0 USD for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("calculates total with tax for single item", () => {
    const result = totalWithTax([{ amount: 100, currency: "USD" }], 0.1);
    expect(result.amount).toBe(110);
  });

  it("calculates total with tax for multiple items", () => {
    const result = totalWithTax(
      [
        { amount: 100, currency: "USD" },
        { amount: 50, currency: "USD" },
      ],
      0.1,
    );
    expect(result.amount).toBe(165);
  });

  it("rounds to 2 decimal places", () => {
    const result = totalWithTax([{ amount: 33.33, currency: "USD" }], 0.08);
    expect(result.amount).toBe(36);
  });

  it("uses currency of first item", () => {
    const result = totalWithTax([{ amount: 100, currency: "EUR" }], 0.1);
    expect(result.currency).toBe("EUR");
  });
});

describe("isRefundEligible", () => {
  it("returns true for order within window", () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recentDate)).toBe(true);
  });

  it("returns false for order outside window", () => {
    const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oldDate)).toBe(false);
  });

  it("returns true exactly at boundary", () => {
    const boundaryDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1);
    expect(isRefundEligible(boundaryDate)).toBe(true);
  });

  it("returns false just outside boundary", () => {
    const outsideDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 - 1);
    expect(isRefundEligible(outsideDate)).toBe(false);
  });

  it("respects custom return window", () => {
    const date = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(date, 14)).toBe(false);
    expect(isRefundEligible(date, 20)).toBe(true);
  });
});