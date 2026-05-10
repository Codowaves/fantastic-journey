import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment.js";

describe("applyDiscount", () => {
  it("should apply valid discount percentage", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 20);
    expect(result).toEqual({ amount: 80, currency: "USD" });
  });

  it("should handle 0% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("should handle 100% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should throw RangeError for negative discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -10)).toThrow(RangeError);
    expect(() => applyDiscount(price, -10)).toThrow("percentOff must be 0–100");
  });

  it("should throw RangeError for discount over 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 150)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow("percentOff must be 0–100");
  });

  it("should preserve currency", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 25);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("should calculate total with tax for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("should calculate total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
      { amount: 25, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.08);
    expect(result).toEqual({ amount: 189, currency: "USD" });
  });

  it("should handle zero tax rate", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("should return zero amount for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should use currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "GBP" },
      { amount: 50, currency: "GBP" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("GBP");
  });
});

describe("isRefundEligible", () => {
  it("should return true for recent orders", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isRefundEligible(yesterday, 30)).toBe(true);
  });

  it("should return false for orders beyond return window", () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oldDate, 30)).toBe(false);
  });

  it("should use default 30-day window", () => {
    const date29DaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(date29DaysAgo)).toBe(true);

    const date31DaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(date31DaysAgo)).toBe(false);
  });

  it("should respect custom return window", () => {
    const date10DaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(date10DaysAgo, 7)).toBe(false);
    expect(isRefundEligible(date10DaysAgo, 14)).toBe(true);
  });

  it("should handle order placed today", () => {
    const today = new Date();
    expect(isRefundEligible(today, 30)).toBe(true);
  });
});
