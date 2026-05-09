import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment";

describe("applyDiscount", () => {
  it("should apply 0% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("should apply 50% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 50);
    expect(result).toEqual({ amount: 50, currency: "USD" });
  });

  it("should apply 100% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should round discount amounts correctly", () => {
    const price: Money = { amount: 99.99, currency: "USD" };
    const result = applyDiscount(price, 15);
    expect(result.amount).toBeCloseTo(84.99, 2);
  });

  it("should preserve currency when applying discount", () => {
    const price: Money = { amount: 200, currency: "EUR" };
    const result = applyDiscount(price, 25);
    expect(result.currency).toBe("EUR");
  });

  it("should throw RangeError for negative percentOff", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    expect(() => applyDiscount(price, -1)).toThrow("percentOff must be 0–100");
  });

  it("should throw RangeError for percentOff > 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow(RangeError);
  });

  it("should handle fractional percentOff", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 12.5);
    expect(result.amount).toBeCloseTo(87.5, 2);
  });
});

describe("totalWithTax", () => {
  it("should return zero amount for empty items array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should calculate total with tax for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result.amount).toBeCloseTo(110, 2);
    expect(result.currency).toBe("USD");
  });

  it("should calculate total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 50, currency: "USD" },
      { amount: 75, currency: "USD" },
      { amount: 25, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.08);
    expect(result.amount).toBeCloseTo(162, 2);
    expect(result.currency).toBe("USD");
  });

  it("should handle zero tax rate", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0);
    expect(result.amount).toBe(100);
  });

  it("should handle high tax rates", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 1.0);
    expect(result.amount).toBeCloseTo(200, 2);
  });

  it("should use currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "EUR" },
      { amount: 50, currency: "EUR" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("EUR");
  });

  it("should round final amount correctly", () => {
    const items: Money[] = [{ amount: 99.99, currency: "USD" }];
    const result = totalWithTax(items, 0.0875);
    expect(result.amount).toBeCloseTo(108.74, 2);
  });

  it("should handle fractional amounts correctly", () => {
    const items: Money[] = [
      { amount: 19.99, currency: "USD" },
      { amount: 29.99, currency: "USD" },
      { amount: 14.99, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.07);
    expect(result.amount).toBeCloseTo(69.52, 2);
  });
});

describe("isRefundEligible", () => {
  it("should return true for order within default 30-day window", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should return false for order outside default 30-day window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("should return true for order placed today", () => {
    const orderDate = new Date();
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should return true for order placed 1 second ago", () => {
    const orderDate = new Date(Date.now() - 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should handle custom return window", () => {
    const orderDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate, 60)).toBe(true);
    expect(isRefundEligible(orderDate, 45)).toBe(false);
  });

  it("should return false for order exactly at window boundary", () => {
    const orderDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate, 30)).toBe(false);
  });

  it("should handle 7-day return window", () => {
    const recentOrder = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const oldOrder = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recentOrder, 7)).toBe(true);
    expect(isRefundEligible(oldOrder, 7)).toBe(false);
  });

  it("should handle 90-day extended return window", () => {
    const orderDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate, 90)).toBe(true);
  });
});
