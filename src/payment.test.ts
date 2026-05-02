import { describe, expect, it } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "./payment.js";

describe("applyDiscount", () => {
  it("applies a percentage discount to the price", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 20);
    expect(result.amount).toBe(80);
    expect(result.currency).toBe("USD");
  });

  it("throws for percentOff outside 0-100 range", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(RangeError);
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(RangeError);
  });

  it("returns original amount when percentOff is 0", () => {
    const result = applyDiscount({ amount: 50, currency: "EUR" }, 0);
    expect(result.amount).toBe(50);
  });

  it("rounds to two decimal places", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 33);
    expect(result.amount).toBe(66.99);
  });
});

describe("totalWithTax", () => {
  it("returns zero amount for empty items", () => {
    const result = totalWithTax([], 0.1);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("calculates subtotal plus tax", () => {
    const items = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result.amount).toBe(165);
    expect(result.currency).toBe("USD");
  });

  it("rounds to two decimal places", () => {
    const items = [{ amount: 33.33, currency: "USD" }];
    const result = totalWithTax(items, 0.07);
    expect(result.amount).toBe(35.66);
  });
});

describe("isRefundEligible", () => {
  it("returns true when order is within return window", () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recentDate, 30)).toBe(true);
  });

  it("returns false when order is outside return window", () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oldDate, 30)).toBe(false);
  });

  it("uses default return window of 30 days", () => {
    const exactly30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(exactly30DaysAgo)).toBe(false);
  });
});