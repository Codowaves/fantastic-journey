import { describe, expect, it } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("subtracts the requested percentage from the price", () => {
      expect(applyDiscount({ amount: 100, currency: "USD" }, 25)).toEqual({
        amount: 75,
        currency: "USD",
      });
    });

    it("throws a RangeError when percentOff is outside 0-100", () => {
      expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(
        RangeError,
      );
    });
  });

  describe("totalWithTax", () => {
    it("sums the items and applies the tax rate", () => {
      const items = [
        { amount: 100, currency: "USD" },
        { amount: 50, currency: "USD" },
      ];

      expect(totalWithTax(items, 0.1)).toEqual({
        amount: 165,
        currency: "USD",
      });
    });

    it("returns a zero USD total for an empty item list", () => {
      expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
    });
  });

  describe("isRefundEligible", () => {
    it("treats a recent order as eligible within the return window", () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

      expect(isRefundEligible(oneDayAgo)).toBe(true);
    });

    it("treats an order older than the return window as ineligible", () => {
      const thirtyOneDaysAgo = new Date(
        Date.now() - 31 * 24 * 60 * 60 * 1000,
      );

      expect(isRefundEligible(thirtyOneDaysAgo)).toBe(false);
    });
  });
});
