import { describe, expect, it } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("reduces the price by the given percent and rounds to cents", () => {
      const result = applyDiscount({ amount: 19.99, currency: "USD" }, 10);
      expect(result).toEqual({ amount: 17.99, currency: "USD" });
    });

    it("returns the original price when percentOff is 0", () => {
      const price = { amount: 50, currency: "EUR" };
      expect(applyDiscount(price, 0)).toEqual(price);
    });

    it("throws RangeError when percentOff is negative or above 100", () => {
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(
        RangeError,
      );
    });
  });

  describe("totalWithTax", () => {
    it("sums items and applies the tax rate, rounded to cents", () => {
      const items = [
        { amount: 10, currency: "USD" },
        { amount: 5.5, currency: "USD" },
        { amount: 4.49, currency: "USD" },
      ];
      expect(totalWithTax(items, 0.0825)).toEqual({
        amount: 21.64,
        currency: "USD",
      });
    });

    it("returns a zero USD total when the items array is empty", () => {
      expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
    });

    it("uses the currency of the first item", () => {
      expect(
        totalWithTax(
          [
            { amount: 100, currency: "EUR" },
            { amount: 50, currency: "EUR" },
          ],
          0.2,
        ),
      ).toEqual({ amount: 180, currency: "EUR" });
    });
  });

  describe("isRefundEligible", () => {
    it("returns true for an order placed within the return window", () => {
      const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(recent, 30)).toBe(true);
    });

    it("returns false for an order placed before the return window", () => {
      const oldOrder = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(oldOrder, 30)).toBe(false);
    });

    it("uses a 30-day default window when none is provided", () => {
      const twentyNineDaysAgo = new Date(
        Date.now() - 29 * 24 * 60 * 60 * 1000,
      );
      expect(isRefundEligible(twentyNineDaysAgo)).toBe(true);
    });
  });
});
