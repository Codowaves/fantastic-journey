import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "../src/payment";

describe("applyDiscount", () => {
  it("should apply 0% discount (no change)", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("should apply 50% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 50);
    expect(result).toEqual({ amount: 50, currency: "USD" });
  });

  it("should apply 100% discount (free)", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should throw RangeError for negative percentOff", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    expect(() => applyDiscount(price, -1)).toThrow("percentOff must be 0–100");
  });

  it("should throw RangeError for percentOff > 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 101)).toThrow("percentOff must be 0–100");
  });

  it("should preserve currency", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 20);
    expect(result.currency).toBe("EUR");
  });

  it("should round correctly", () => {
    const price: Money = { amount: 99.99, currency: "USD" };
    const result = applyDiscount(price, 25);
    expect(result.amount).toBe(74.99);
  });
});

describe("totalWithTax", () => {
  it("should return 0 for empty items array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should calculate total with tax for one item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("should calculate total with tax for many items", () => {
    const items: Money[] = [
      { amount: 50, currency: "USD" },
      { amount: 30, currency: "USD" },
      { amount: 20, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("should use currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "EUR" },
      { amount: 50, currency: "EUR" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("EUR");
  });

  it("should handle zero tax rate", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("should round correctly", () => {
    const items: Money[] = [{ amount: 99.99, currency: "USD" }];
    const result = totalWithTax(items, 0.08);
    expect(result.amount).toBe(107.99);
  });
});

describe("isRefundEligible", () => {
  it("should return true for order within default 30-day window", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should return false for order outside default 30-day window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("should return true for order exactly at window boundary (29 days)", () => {
    const orderDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should return false for order just outside window boundary (30.1 days)", () => {
    const orderDate = new Date(Date.now() - 30.1 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("should respect custom return window", () => {
    const orderDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000); // 50 days ago
    expect(isRefundEligible(orderDate, 60)).toBe(true);
    expect(isRefundEligible(orderDate, 30)).toBe(false);
  });

  it("should return true for order placed today", () => {
    const orderDate = new Date();
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("should return true for order placed 1 hour ago", () => {
    const orderDate = new Date(Date.now() - 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });
});
