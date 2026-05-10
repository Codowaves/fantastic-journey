import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment.js";

describe("applyDiscount", () => {
  it("applies a valid discount percentage", () => {
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

  it("throws on discount > 100", () => {
    const price: Money = { amount: 100, currency: "USD" };
    expect(() => applyDiscount(price, 150)).toThrow(RangeError);
    expect(() => applyDiscount(price, 150)).toThrow("percentOff must be 0–100");
  });

  it("rounds correctly for fractional results", () => {
    const price: Money = { amount: 33.33, currency: "USD" };
    const result = applyDiscount(price, 15);
    // 33.33 * (100 - 15) / 100 = 28.3305, rounded to 28.33
    expect(result.amount).toBeCloseTo(28.33, 2);
  });
});

describe("totalWithTax", () => {
  it("calculates total with tax for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1); // 10% tax
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 50, currency: "USD" },
      { amount: 30, currency: "USD" },
      { amount: 20, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.08); // 8% tax
    // subtotal = 100, with 8% tax = 108
    expect(result).toEqual({ amount: 108, currency: "USD" });
  });

  it("returns zero for empty items array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("uses currency from first item", () => {
    const items: Money[] = [
      { amount: 100, currency: "GBP" },
      { amount: 50, currency: "GBP" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("GBP");
  });

  it("handles 0% tax rate", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("rounds to 2 decimal places", () => {
    const items: Money[] = [{ amount: 33.33, currency: "USD" }];
    const result = totalWithTax(items, 0.15); // 15% tax
    // 33.33 * 1.15 = 38.3295, rounded to 38.33
    expect(result.amount).toBeCloseTo(38.33, 2);
  });
});

describe("isRefundEligible", () => {
  it("returns true for orders within return window", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oneDayAgo, 30)).toBe(true);
  });

  it("returns true for orders at the edge of return window", () => {
    const exactlyNDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(exactlyNDaysAgo, 30)).toBe(true);
  });

  it("returns false for orders outside return window", () => {
    const longAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(longAgo, 30)).toBe(false);
  });

  it("uses default 30-day window", () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(twentyDaysAgo)).toBe(true);

    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(fortyDaysAgo)).toBe(false);
  });

  it("respects custom return window", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(tenDaysAgo, 7)).toBe(false);
    expect(isRefundEligible(tenDaysAgo, 14)).toBe(true);
  });

  it("returns false for future dates", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isRefundEligible(tomorrow, 30)).toBe(false);
  });
});
