import { describe, test, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment";

describe("applyDiscount", () => {
  test("applies discount correctly to price", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 20);
    expect(result).toEqual({ amount: 80, currency: "USD" });
  });

  test("handles 0% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  test("handles 100% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  test("throws RangeError for negative discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -10)).toThrow(RangeError);
    expect(() => applyDiscount(price, -10)).toThrow("percentOff must be 0–100");
  });

  test("throws RangeError for discount over 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow("percentOff must be 0–100");
  });

  test("preserves currency", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 10);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  test("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
      { amount: 25, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1); // 10% tax
    expect(result).toEqual({ amount: 192.5, currency: "USD" });
  });

  test("returns zero amount for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  test("handles single item", () => {
    const items: Money[] = [{ amount: 100, currency: "GBP" }];
    const result = totalWithTax(items, 0.2); // 20% tax
    expect(result).toEqual({ amount: 120, currency: "GBP" });
  });

  test("handles zero tax rate", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 150, currency: "USD" });
  });

  test("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "CAD" },
      { amount: 50, currency: "CAD" },
    ];
    const result = totalWithTax(items, 0.05);
    expect(result.currency).toBe("CAD");
  });
});

describe("isRefundEligible", () => {
  test("returns true for recent order within default window", () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(recentDate)).toBe(true);
  });

  test("returns false for old order outside default window", () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    expect(isRefundEligible(oldDate)).toBe(false);
  });

  test("returns true for order at boundary (just within window)", () => {
    const boundaryDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000); // 29 days ago
    expect(isRefundEligible(boundaryDate, 30)).toBe(true);
  });

  test("returns false for order just outside window", () => {
    const outsideDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(outsideDate, 30)).toBe(false);
  });

  test("respects custom return window", () => {
    const testDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000); // 50 days ago
    expect(isRefundEligible(testDate, 60)).toBe(true);
    expect(isRefundEligible(testDate, 40)).toBe(false);
  });

  test("returns true for very recent order", () => {
    const todayDate = new Date();
    expect(isRefundEligible(todayDate)).toBe(true);
  });
});
