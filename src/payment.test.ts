import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "./payment";

describe("applyDiscount", () => {
  it("applies standard discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 10);
    expect(result.amount).toBe(90);
    expect(result.currency).toBe("USD");
  });

  it("applies 0% discount (no change)", () => {
    const result = applyDiscount({ amount: 99.99, currency: "EUR" }, 0);
    expect(result.amount).toBe(99.99);
  });

  it("applies 100% discount (free)", () => {
    const result = applyDiscount({ amount: 50, currency: "GBP" }, 100);
    expect(result.amount).toBe(0);
  });

  it("throws for negative percentOff", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(RangeError);
  });

  it("throws for percentOff over 100", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(RangeError);
  });

  it("rounds to 2 decimal places", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 33);
    expect(result.amount).toBe(66.99);
  });
});

describe("totalWithTax", () => {
  it("returns zero USD for empty items", () => {
    const result = totalWithTax([], 0.08);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("sums items and adds tax", () => {
    const items: Money[] = [
      { amount: 10, currency: "USD" },
      { amount: 20, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result.amount).toBe(33);
    expect(result.currency).toBe("USD");
  });

  it("rounds to 2 decimal places", () => {
    const items: Money[] = [{ amount: 16.66, currency: "USD" }];
    const result = totalWithTax(items, 0.08);
    expect(result.amount).toBe(17.99);
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

  it("respects custom return window", () => {
    const day45 = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(day45, 30)).toBe(false);
    expect(isRefundEligible(day45, 60)).toBe(true);
  });
});