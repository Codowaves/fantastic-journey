import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "../src/payment.js";

describe("applyDiscount", () => {
  it("applies 50% discount correctly", () => {
    const result = applyDiscount({ amount: 1000, currency: "USD" }, 50);
    expect(result).toEqual({ amount: 500, currency: "USD" });
  });

  it("applies 100% discount without throwing", () => {
    const result = applyDiscount({ amount: 1000, currency: "USD" }, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("applies 0% discount correctly", () => {
    const result = applyDiscount({ amount: 1000, currency: "USD" }, 0);
    expect(result).toEqual({ amount: 1000, currency: "USD" });
  });

  it("throws on negative percentOff", () => {
    expect(() => {
      applyDiscount({ amount: 1000, currency: "USD" }, -1);
    }).toThrow(RangeError);
  });

  it("throws on percentOff > 100", () => {
    expect(() => {
      applyDiscount({ amount: 1000, currency: "USD" }, 101);
    }).toThrow(RangeError);
  });

  it("preserves currency", () => {
    const result = applyDiscount({ amount: 500, currency: "EUR" }, 25);
    expect(result.currency).toBe("EUR");
  });
});

describe("totalWithTax", () => {
  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 1000, currency: "USD" },
      { amount: 500, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.1);
    expect(result).toEqual({ amount: 1650, currency: "USD" });
  });

  it("returns zero amount for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("uses currency from first item", () => {
    const items: Money[] = [{ amount: 1000, currency: "GBP" }];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("GBP");
  });
});

describe("isRefundEligible", () => {
  it("returns true for recent orders", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isRefundEligible(yesterday)).toBe(true);
  });

  it("returns false for orders outside window", () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oldDate)).toBe(false);
  });

  it("respects custom return window", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(tenDaysAgo, 7)).toBe(false);
    expect(isRefundEligible(tenDaysAgo, 14)).toBe(true);
  });
});
