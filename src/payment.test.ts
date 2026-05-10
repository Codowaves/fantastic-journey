import { describe, expect, it } from "vitest";
import { applyDiscount, isRefundEligible, totalWithTax, type Money } from "./payment";

describe("applyDiscount", () => {
  it("applies a valid discount percentage", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 20);
    expect(result).toEqual({ amount: 80, currency: "USD" });
  });

  it("handles 0% discount", () => {
    const price: Money = { amount: 50, currency: "EUR" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 50, currency: "EUR" });
  });

  it("handles 100% discount", () => {
    const price: Money = { amount: 75, currency: "GBP" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "GBP" });
  });

  it("throws RangeError for negative percentOff", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -10)).toThrow(RangeError);
    expect(() => applyDiscount(price, -10)).toThrow("percentOff must be 0–100");
  });

  it("throws RangeError for percentOff > 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 150)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow("percentOff must be 0–100");
  });

  it("preserves currency from original price", () => {
    const price: Money = { amount: 200, currency: "JPY" };
    const result = applyDiscount(price, 25);
    expect(result.currency).toBe("JPY");
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

  it("returns zero amount with USD currency for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("calculates total for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "EUR" }];
    const result = totalWithTax(items, 0.2); // 20% tax
    expect(result).toEqual({ amount: 120, currency: "EUR" });
  });

  it("handles 0% tax rate", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 150, currency: "USD" });
  });

  it("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "GBP" },
      { amount: 50, currency: "GBP" },
    ];
    const result = totalWithTax(items, 0.15);
    expect(result.currency).toBe("GBP");
  });
});

describe("isRefundEligible", () => {
  it("returns true when within default return window", () => {
    const orderDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false when outside default return window", () => {
    const orderDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("returns true when exactly at boundary", () => {
    const orderDate = new Date(Date.now() - 29.9 * 24 * 60 * 60 * 1000); // Just under 30 days
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false when just outside window", () => {
    const orderDate = new Date(Date.now() - 30.1 * 24 * 60 * 60 * 1000); // Just over 30 days
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("respects custom return window days", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(orderDate, 7)).toBe(false);
    expect(isRefundEligible(orderDate, 14)).toBe(true);
  });

  it("handles very recent orders", () => {
    const orderDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });
});
