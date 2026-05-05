import { describe, expect, it } from "vitest";
import {
  type Money,
  applyDiscount,
  totalWithTax,
  isRefundEligible,
} from "./payment.js";

describe("applyDiscount", () => {
  it("applies a typical discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 20);
    expect(result).toEqual({ amount: 80, currency: "USD" });
  });

  it("returns original price when percentOff is 0", () => {
    const result = applyDiscount({ amount: 99.99, currency: "USD" }, 0);
    expect(result).toEqual({ amount: 99.99, currency: "USD" });
  });

  it("reduces price to zero when percentOff is 100", () => {
    const result = applyDiscount({ amount: 50, currency: "EUR" }, 100);
    expect(result).toEqual({ amount: 0, currency: "EUR" });
  });

  it("throws RangeError when percentOff is negative", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(
      RangeError,
    );
  });

  it("throws RangeError when percentOff exceeds 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(
      RangeError,
    );
  });
});

describe("totalWithTax", () => {
  it("calculates total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 10, currency: "USD" },
      { amount: 20, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.08);
    expect(result).toEqual({ amount: 32.4, currency: "USD" });
  });

  it("returns zero-amount USD object for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("uses the first item's currency", () => {
    const items: Money[] = [
      { amount: 5, currency: "EUR" },
      { amount: 15, currency: "EUR" },
    ];
    const result = totalWithTax(items, 0.2);
    expect(result.currency).toBe("EUR");
  });

  it("handles a single item", () => {
    const items: Money[] = [{ amount: 50, currency: "USD" }];
    const result = totalWithTax(items, 0.05);
    expect(result).toEqual({ amount: 52.5, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  it("returns true for a recent order within the window", () => {
    const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recentDate)).toBe(true);
  });

  it("returns false for an order outside the window", () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(oldDate)).toBe(false);
  });

  it("respects custom returnWindowDays", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(tenDaysAgo, 7)).toBe(false);
    expect(isRefundEligible(tenDaysAgo, 14)).toBe(true);
  });

  it("uses default window of 30 days", () => {
    const twentyNineDaysAgo = new Date(
      Date.now() - 29 * 24 * 60 * 60 * 1000,
    );
    const thirtyOneDaysAgo = new Date(
      Date.now() - 31 * 24 * 60 * 60 * 1000,
    );
    expect(isRefundEligible(twentyNineDaysAgo)).toBe(true);
    expect(isRefundEligible(thirtyOneDaysAgo)).toBe(false);
  });
});
