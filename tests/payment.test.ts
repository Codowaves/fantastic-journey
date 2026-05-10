import { describe, it, expect } from "vitest";
import {
  applyDiscount,
  totalWithTax,
  isRefundEligible,
  type Money,
} from "../src/payment";

describe("applyDiscount", () => {
  it("applies 0% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("applies 50% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 50);
    expect(result).toEqual({ amount: 50, currency: "USD" });
  });

  it("applies 100% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("throws RangeError for negative discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    expect(() => applyDiscount(price, -1)).toThrow("percentOff must be 0–100");
  });

  it("throws RangeError for discount over 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 101)).toThrow("percentOff must be 0–100");
  });

  it("preserves currency", () => {
    const price: Money = { amount: 100, currency: "EUR" };
    const result = applyDiscount(price, 25);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("returns zero amount for empty items array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("calculates total with tax for one item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
      { amount: 25, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 192.5, currency: "USD" });
  });

  it("handles zero tax rate", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("preserves currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "EUR" },
      { amount: 50, currency: "EUR" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("EUR");
  });

  it("rounds total correctly", () => {
    const items: Money[] = [{ amount: 10.01, currency: "USD" }];
    const result = totalWithTax(items, 0.075);
    expect(result.amount).toBe(10.76);
  });
});

describe("isRefundEligible", () => {
  it("returns true for order within 30-day window", () => {
    const orderDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns true for order exactly at window boundary", () => {
    const orderDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000); // 29 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false for order outside 30-day window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("returns true for very recent order", () => {
    const orderDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("respects custom return window", () => {
    const orderDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    expect(isRefundEligible(orderDate, 60)).toBe(true);
    expect(isRefundEligible(orderDate, 30)).toBe(false);
  });

  it("returns false for order exactly at 30-day boundary", () => {
    const orderDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // exactly 30 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });
});
