import { describe, expect, it } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "../src/payment.js";

describe("applyDiscount", () => {
  it("applies discount correctly", () => {
    const money: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(money, 10)).toEqual({ amount: 90, currency: "USD" });
  });

  it("throws on negative percent", () => {
    const money: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(money, -1)).toThrow(RangeError);
  });

  it("throws on percent over 100", () => {
    const money: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(money, 101)).toThrow(RangeError);
  });

  it("handles 0 discount", () => {
    const money: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(money, 0)).toEqual({ amount: 100, currency: "USD" });
  });

  it("handles 100 discount", () => {
    const money: Money = { amount: 100, currency: "USD" };
    expect(applyDiscount(money, 100)).toEqual({ amount: 0, currency: "USD" });
  });
});

describe("totalWithTax", () => {
  it("returns zero for empty array", () => {
    expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
  });

  it("calculates total with tax", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    expect(totalWithTax(items, 0.1)).toEqual({ amount: 165, currency: "USD" });
  });

  it("rounds to two decimal places", () => {
    const items: Money[] = [{ amount: 33.33, currency: "USD" }];
    expect(totalWithTax(items, 0.08)).toEqual({ amount: 36, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  it("returns true for recent order", () => {
    const recentDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    expect(isRefundEligible(recentDate, 30)).toBe(true);
  });

  it("returns false for old order", () => {
    const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45);
    expect(isRefundEligible(oldDate, 30)).toBe(false);
  });

  it("uses default window of 30 days", () => {
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20);
    expect(isRefundEligible(date)).toBe(true);
  });
});
