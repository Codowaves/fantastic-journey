import { describe, expect, it } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("reduces the amount by the given percentage and preserves the currency", () => {
      expect(applyDiscount({ amount: 100, currency: "USD" }, 20)).toEqual({
        amount: 80,
        currency: "USD",
      });
    });

    it("throws a RangeError when percentOff is outside 0–100", () => {
      const price = { amount: 100, currency: "USD" };

      expect(() => applyDiscount(price, -1)).toThrow(RangeError);
      expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    });
  });

  describe("totalWithTax", () => {
    it("sums the items and applies the tax rate using the first item's currency", () => {
      expect(
        totalWithTax(
          [
            { amount: 100, currency: "EUR" },
            { amount: 50, currency: "EUR" },
          ],
          0.1,
        ),
      ).toEqual({ amount: 165, currency: "EUR" });
    });

    it("returns a zero USD amount for an empty item list", () => {
      expect(totalWithTax([], 0.2)).toEqual({ amount: 0, currency: "USD" });
    });
  });

  describe("isRefundEligible", () => {
    it("treats an order within the return window as eligible", () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      expect(isRefundEligible(oneDayAgo)).toBe(true);
    });

    it("treats an order past the return window as ineligible", () => {
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

      expect(isRefundEligible(thirtyOneDaysAgo)).toBe(false);
    });
  });
});
