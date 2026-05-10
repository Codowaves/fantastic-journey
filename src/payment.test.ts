import { describe, it, expect } from "vitest";
import {
  applyDiscount,
  totalWithTax,
  isRefundEligible,
  type Money,
} from "./payment.js";

describe("applyDiscount", () => {
  it("applies discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 20);
    expect(result).toEqual({ amount: 80, currency: "USD" });
  });

  it("handles 0% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("handles 100% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("preserves currency", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 10);
    expect(result.currency).toBe("EUR");
  });

  it("throws on negative discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -5)).toThrow(RangeError);
    expect(() => applyDiscount(price, -5)).toThrow("percentOff must be 0–100");
  });

  it("throws on discount over 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow("percentOff must be 0–100");
  });
});

describe("totalWithTax", () => {
  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
      { amount: 25, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1); // 10% tax
    expect(result).toEqual({ amount: 192.5, currency: "USD" });
  });

  it("handles empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("handles single item", () => {
    const items: Money[] = [{ amount: 100, currency: "EUR" }];
    const result = totalWithTax(items, 0.2); // 20% tax
    expect(result).toEqual({ amount: 120, currency: "EUR" });
  });

  it("handles zero tax rate", () => {
    const items: Money[] = [
      { amount: 50, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 10, currency: "GBP" },
      { amount: 20, currency: "GBP" },
    ];
    const result = totalWithTax(items, 0.15);
    expect(result.currency).toBe("GBP");
  });
});

describe("isRefundEligible", () => {
  it("returns true for order within return window", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false for order outside return window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("returns true for order exactly at boundary", () => {
    const orderDate = new Date(Date.now() - 29.5 * 24 * 60 * 60 * 1000); // 29.5 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false for order just outside boundary", () => {
    const orderDate = new Date(Date.now() - 30.5 * 24 * 60 * 60 * 1000); // 30.5 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("respects custom return window", () => {
    const orderDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    expect(isRefundEligible(orderDate, 15)).toBe(false);
    expect(isRefundEligible(orderDate, 25)).toBe(true);
  });

  it("returns true for recent order", () => {
    const orderDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });
});
