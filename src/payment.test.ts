import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "./payment";

describe("applyDiscount", () => {
  it("applies a percentage discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 10);
    expect(result.amount).toBe(90);
    expect(result.currency).toBe("USD");
  });

  it("throws for negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow();
  });

  it("throws for percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow();
  });

  it("rounds to two decimals", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 15);
    expect(result.amount).toBe(84.99);
  });
});

describe("totalWithTax", () => {
  it("returns zero for empty items", () => {
    const result = totalWithTax([], 0.08);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("adds tax to subtotal", () => {
    const items = [{ amount: 100, currency: "USD" }, { amount: 50, currency: "USD" }];
    const result = totalWithTax(items, 0.1);
    expect(result.amount).toBe(165);
    expect(result.currency).toBe("USD");
  });
});

describe("isRefundEligible", () => {
  it("returns true within return window", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent)).toBe(true);
  });

  it("returns false outside return window", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old)).toBe(false);
  });

  it("respects custom return window", () => {
    const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent, 7)).toBe(true);
    expect(isRefundEligible(recent, 3)).toBe(false);
  });
});
