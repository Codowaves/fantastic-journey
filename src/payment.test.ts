import { describe, expect, it } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("applies the percentage off and rounds to two decimals, preserving currency", () => {
      expect(applyDiscount({ amount: 19.99, currency: "USD" }, 10)).toEqual({
        amount: 17.99,
        currency: "USD",
      });
    });

    it("throws a RangeError when percentOff is outside 0–100", () => {
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(
        RangeError,
      );
    });
  });

  describe("totalWithTax", () => {
    it("sums the items and applies tax, rounding to two decimals and keeping the first currency", () => {
      expect(
        totalWithTax(
          [
            { amount: 10, currency: "EUR" },
            { amount: 5, currency: "EUR" },
          ],
          0.2,
        ),
      ).toEqual({ amount: 18, currency: "EUR" });
    });

    it("returns a zero USD total for an empty item list", () => {
      expect(totalWithTax([], 0.2)).toEqual({ amount: 0, currency: "USD" });
    });
  });

  describe("isRefundEligible", () => {
    it("returns true for an order placed within the default 30-day window", () => {
      const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(recent)).toBe(true);
    });

    it("returns false for an order older than the return window", () => {
      const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(old)).toBe(false);
    });
  });
});
