import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "../src/payment.js";

describe("applyDiscount", () => {
  it("applies 0% discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 0);
    expect(result.amount).toBe(100);
  });

  it("applies 100% discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 100);
    expect(result.amount).toBe(0);
  });

  it("applies partial discount and rounds to cents", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 20);
    expect(result.amount).toBe(79.99);
  });

  it("throws for negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow();
  });

  it("throws for percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow();
  });

  it("preserves currency", () => {
    const result = applyDiscount({ amount: 50, currency: "EUR" }, 10);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("returns 0 for empty array", () => {
    const result = totalWithTax([], 0.08);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("handles single item", () => {
    const result = totalWithTax([{ amount: 100, currency: "USD" }], 0.08);
    expect(result.amount).toBe(108);
  });

  it("sums multiple items with tax", () => {
    const result = totalWithTax(
      [
        { amount: 50, currency: "USD" },
        { amount: 30, currency: "USD" },
      ],
      0.1
    );
    expect(result.amount).toBe(88);
  });

  it("rounds to cents", () => {
    const result = totalWithTax([{ amount: 33.33, currency: "USD" }], 0.08);
    expect(result.amount).toBe(36);
  });

  it("uses currency of first item", () => {
    const result = totalWithTax([{ amount: 10, currency: "EUR" }], 0.2);
    expect(result.currency).toBe("EUR");
  });
});

describe("isRefundEligible", () => {
  it("returns true within window", () => {
    const recent = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // 5 days ago
    expect(isRefundEligible(recent)).toBe(true);
  });

  it("returns false outside window", () => {
    const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 31); // 31 days ago
    expect(isRefundEligible(old)).toBe(false);
  });

  it("respects custom return window", () => {
    const day29 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 29);
    const day31 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 31);
    expect(isRefundEligible(day29, 30)).toBe(true);
    expect(isRefundEligible(day31, 30)).toBe(false);
  });

  it("handles exactly at boundary", () => {
    const boundary = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1);
    expect(isRefundEligible(boundary)).toBe(true);
  });
});