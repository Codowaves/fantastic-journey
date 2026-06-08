import { describe, expect, it } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("applies a percent discount to the price and rounds to two decimals", () => {
      const result = applyDiscount({ amount: 19.99, currency: "USD" }, 10);
      expect(result).toEqual({ amount: 17.99, currency: "USD" });
    });

    it("preserves the original currency on the discounted price", () => {
      const result = applyDiscount({ amount: 50, currency: "EUR" }, 25);
      expect(result.currency).toBe("EUR");
    });

    it("throws RangeError when percentOff is below 0", () => {
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(
        RangeError,
      );
    });

    it("throws RangeError when percentOff is above 100", () => {
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(
        RangeError,
      );
    });

    it("returns the original amount when percentOff is 0 and the full price when 100", () => {
      expect(applyDiscount({ amount: 9.99, currency: "USD" }, 0)).toEqual({
        amount: 9.99,
        currency: "USD",
      });
      expect(applyDiscount({ amount: 9.99, currency: "USD" }, 100)).toEqual({
        amount: 0,
        currency: "USD",
      });
    });
  });

  describe("totalWithTax", () => {
    it("sums line items, applies the tax rate, and rounds to two decimals", () => {
      const result = totalWithTax(
        [
          { amount: 10, currency: "USD" },
          { amount: 5.5, currency: "USD" },
        ],
        0.08,
      );
      expect(result).toEqual({ amount: 16.74, currency: "USD" });
    });

    it("uses the first item's currency on the resulting total", () => {
      const result = totalWithTax(
        [
          { amount: 100, currency: "EUR" },
          { amount: 50, currency: "USD" },
        ],
        0,
      );
      expect(result.currency).toBe("EUR");
    });

    it("returns a zero USD total when the items array is empty", () => {
      expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
    });
  });

  describe("isRefundEligible", () => {
    it("returns true for an order placed within the default 30-day return window", () => {
      const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(recent)).toBe(true);
    });

    it("returns false for an order placed well outside the return window", () => {
      const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(old)).toBe(false);
    });

    it("honors a custom returnWindowDays argument", () => {
      const within = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const beyond = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(within, 7)).toBe(true);
      expect(isRefundEligible(beyond, 7)).toBe(false);
    });
  });
});
