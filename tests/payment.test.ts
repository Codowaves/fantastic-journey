import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "../src/payment";

describe("applyDiscount", () => {
  it("applies 0% discount (no change)", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 0);
    expect(result.amount).toBe(100);
  });

  it("applies 100% discount (free)", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 100);
    expect(result.amount).toBe(0);
  });

  it("throws for negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(RangeError);
  });

  it("throws for percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(RangeError);
  });

  it("rounds to 2 decimal places", () => {
    const result = applyDiscount({ amount: 49.99, currency: "USD" }, 20);
    expect(result.amount).toBe(39.99);
  });

  it("preserves currency", () => {
    const result = applyDiscount({ amount: 50, currency: "EUR" }, 10);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("returns 0 USD for empty array", () => {
    const result = totalWithTax([], 0.08);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("handles a single item", () => {
    const result = totalWithTax([{ amount: 100, currency: "USD" }], 0.08);
    expect(result.amount).toBe(108);
  });

  it("sums multiple items with tax", () => {
    const result = totalWithTax(
      [
        { amount: 50, currency: "USD" },
        { amount: 30, currency: "USD" },
      ],
      0.10
    );
    expect(result.amount).toBe(88);
  });

  it("uses currency of first item", () => {
    const result = totalWithTax([{ amount: 10, currency: "GBP" }], 0);
    expect(result.currency).toBe("GBP");
  });

  it("rounds to 2 decimal places", () => {
    const result = totalWithTax(
      [
        { amount: 33.33, currency: "USD" },
        { amount: 33.33, currency: "USD" },
        { amount: 33.34, currency: "USD" },
      ],
      0.08
    );
    expect(result.amount).toBe(108);
  });
});

describe("isRefundEligible", () => {
  it("eligible within window", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent)).toBe(true);
  });

  it("not eligible outside window", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old)).toBe(false);
  });

  it("boundary: exactly at 30 days", () => {
    const boundary = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1);
    expect(isRefundEligible(boundary)).toBe(true);
  });

  it("respects custom window", () => {
    const now = Date.now();
    const sixDaysAgo = new Date(now - 6 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000 - 1);
    expect(isRefundEligible(sixDaysAgo, 7)).toBe(true);
    expect(isRefundEligible(sevenDaysAgo, 7)).toBe(false);
  });
});