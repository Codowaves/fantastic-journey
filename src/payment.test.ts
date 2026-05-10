import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment";

describe("applyDiscount", () => {
  it("applies 10% discount correctly", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 10);
    expect(result).toEqual({ amount: 90, currency: "USD" });
  });

  it("applies 50% discount correctly", () => {
    const price: Money = { amount: 200, currency: "EUR" };
    const result = applyDiscount(price, 50);
    expect(result).toEqual({ amount: 100, currency: "EUR" });
  });

  it("handles 0% discount (no change)", () => {
    const price: Money = { amount: 150, currency: "GBP" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 150, currency: "GBP" });
  });

  it("handles 100% discount (free)", () => {
    const price: Money = { amount: 99.99, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("rounds fractional results correctly", () => {
    const price: Money = { amount: 99.99, currency: "USD" };
    const result = applyDiscount(price, 33);
    // 99.99 * (100 - 33) / 100 = 66.9933, rounded
    expect(result.amount).toBeCloseTo(66.99, 2);
  });

  it("preserves currency", () => {
    const price: Money = { amount: 100, currency: "JPY" };
    const result = applyDiscount(price, 20);
    expect(result.currency).toBe("JPY");
  });

  it("throws RangeError for negative percentOff", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    expect(() => applyDiscount(price, -1)).toThrow("percentOff must be 0–100");
  });

  it("throws RangeError for percentOff > 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 200)).toThrow(RangeError);
  });

  it("handles edge case of percentOff exactly at boundary", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 100)).not.toThrow();
    expect(() => applyDiscount(price, 0)).not.toThrow();
  });
});

describe("totalWithTax", () => {
  it("calculates total with 10% tax for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 50, currency: "EUR" },
      { amount: 75, currency: "EUR" },
      { amount: 25, currency: "EUR" },
    ];
    const result = totalWithTax(items, 0.2); // 20% tax
    // Subtotal: 150, with 20% tax: 180
    expect(result).toEqual({ amount: 180, currency: "EUR" });
  });

  it("handles empty items array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("handles zero tax rate", () => {
    const items: Money[] = [
      { amount: 100, currency: "GBP" },
      { amount: 50, currency: "GBP" },
    ];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 150, currency: "GBP" });
  });

  it("rounds fractional results correctly", () => {
    const items: Money[] = [{ amount: 99.99, currency: "USD" }];
    const result = totalWithTax(items, 0.0825); // 8.25% tax
    // 99.99 * 1.0825 = 108.239175, rounded to 108.24
    expect(result.amount).toBeCloseTo(108.24, 2);
  });

  it("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "JPY" },
      { amount: 50, currency: "JPY" },
    ];
    const result = totalWithTax(items, 0.08);
    expect(result.currency).toBe("JPY");
  });

  it("handles high tax rates", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 1.0); // 100% tax
    expect(result).toEqual({ amount: 200, currency: "USD" });
  });

  it("handles negative tax rate (discount scenario)", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, -0.1); // -10% "tax" (discount)
    expect(result).toEqual({ amount: 90, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  it("returns true for order within default 30-day window", () => {
    const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns false for order beyond default 30-day window", () => {
    const orderDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    expect(isRefundEligible(orderDate)).toBe(false);
  });

  it("returns true for order exactly at 29 days", () => {
    const orderDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("handles custom return window", () => {
    const orderDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000); // 50 days ago
    expect(isRefundEligible(orderDate, 60)).toBe(true); // 60-day window
    expect(isRefundEligible(orderDate, 45)).toBe(false); // 45-day window
  });

  it("returns true for very recent order (today)", () => {
    const orderDate = new Date();
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("returns true for order 1 second ago", () => {
    const orderDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("handles 0-day return window (always false)", () => {
    const orderDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isRefundEligible(orderDate, 0)).toBe(false);
  });

  it("handles 1-day return window", () => {
    const orderDate = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
    expect(isRefundEligible(orderDate, 1)).toBe(true);

    const oldOrder = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    expect(isRefundEligible(oldOrder, 1)).toBe(false);
  });

  it("returns true for future dates (edge case - negative difference)", () => {
    // Future date: now - orderMs is negative, which is < any positive returnWindowDays
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    expect(isRefundEligible(futureDate)).toBe(true);
  });
});
