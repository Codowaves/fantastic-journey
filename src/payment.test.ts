import { describe, expect, it } from "vitest";
import { applyDiscount, isRefundEligible, totalWithTax, type Money } from "./payment.js";

describe("applyDiscount", () => {
  it("applies discount correctly on happy path", () => {
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

  it("throws on negative discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -10)).toThrow(RangeError);
    expect(() => applyDiscount(price, -10)).toThrow("percentOff must be 0–100");
  });

  it("throws on discount above 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 150)).toThrow(RangeError);
  });

  it("preserves currency", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 10);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("calculates total with tax on happy path", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1); // 10% tax
    expect(result).toEqual({ amount: 165, currency: "USD" });
  });

  it("handles empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("handles single item", () => {
    const items: Money[] = [{ amount: 100, currency: "GBP" }];
    const result = totalWithTax(items, 0.2);
    expect(result).toEqual({ amount: 120, currency: "GBP" });
  });

  it("handles zero tax rate", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 150, currency: "USD" });
  });

  it("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 75, currency: "CAD" },
      { amount: 25, currency: "CAD" },
    ];
    const result = totalWithTax(items, 0.05);
    expect(result.currency).toBe("CAD");
  });
});

describe("isRefundEligible", () => {
  it("returns true for recent order within window", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false for order outside default window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("returns true for order at boundary (29 days)", () => {
    const orderDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("respects custom return window", () => {
    const orderDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    expect(isRefundEligible(orderDate, 15)).toBe(false);
    expect(isRefundEligible(orderDate, 25)).toBe(true);
  });

  it("handles order from today", () => {
    const orderDate = new Date();
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("handles very old orders", () => {
    const orderDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });
});
