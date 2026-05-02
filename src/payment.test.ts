import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment";

describe("applyDiscount", () => {
  it("applies percentage discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(price, 10)).toEqual({ amount: 90, currency: "USD" });
  });

  it("throws on negative percent", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
  });

  it("throws on percent over 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
  });

  it("handles 0% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(price, 0)).toEqual({ amount: 100, currency: "USD" });
  });

  it("handles 100% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(price, 100)).toEqual({ amount: 0, currency: "USD" });
  });
});

describe("totalWithTax", () => {
  it("returns zero for empty array", () => {
    expect(totalWithTax([], 0.08)).toEqual({ amount: 0, currency: "USD" });
  });

  it("sums items and applies tax", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    expect(totalWithTax(items, 0.1)).toEqual({ amount: 165, currency: "USD" });
  });

  it("rounds to two decimal places", () => {
    const items: Money[] = [{ amount: 33.33, currency: "USD" }];
    expect(totalWithTax(items, 0.08).amount).toBeCloseTo(36, 1);
  });
});

describe("isRefundEligible", () => {
  it("returns true within return window", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent, 30)).toBe(true);
  });

  it("returns false outside return window", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old, 30)).toBe(false);
  });

  it("uses default 30-day window", () => {
    const recent = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent)).toBe(true);
  });
});