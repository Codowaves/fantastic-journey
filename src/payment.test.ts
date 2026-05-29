import { describe, expect, it } from "vitest";

import {
  applyDiscount,
  isRefundEligible,
  totalWithTax,
  type Money,
} from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("returns price unchanged when percentOff is 0", () => {
      const price: Money = { amount: 100, currency: "USD" };
      expect(applyDiscount(price, 0)).toEqual({ amount: 100, currency: "USD" });
    });

    it("applies 50% discount correctly", () => {
      const price: Money = { amount: 100, currency: "USD" };
      expect(applyDiscount(price, 50)).toEqual({ amount: 50, currency: "USD" });
    });

    it("applies 100% discount (free)", () => {
      const price: Money = { amount: 99.99, currency: "USD" };
      expect(applyDiscount(price, 100)).toEqual({ amount: 0, currency: "USD" });
    });

    it("throws RangeError when percentOff is negative", () => {
      const price: Money = { amount: 100, currency: "USD" };
      expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    });

    it("throws RangeError when percentOff is greater than 100", () => {
      const price: Money = { amount: 100, currency: "USD" };
      expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    });

    it("rounds to 2 decimal places", () => {
      const price: Money = { amount: 99.99, currency: "USD" };
      expect(applyDiscount(price, 33)).toEqual({
        amount: 66.99,
        currency: "USD",
      });
    });
  });

  describe("totalWithTax", () => {
    it("returns zero Money with USD currency for empty array", () => {
      expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
    });

    it("calculates total with tax for single item", () => {
      const items: Money[] = [{ amount: 100, currency: "USD" }];
      expect(totalWithTax(items, 0.1)).toEqual({
        amount: 110,
        currency: "USD",
      });
    });

    it("calculates total with tax for multiple items", () => {
      const items: Money[] = [
        { amount: 50, currency: "USD" },
        { amount: 30, currency: "USD" },
        { amount: 20, currency: "USD" },
      ];
      expect(totalWithTax(items, 0.1)).toEqual({
        amount: 110,
        currency: "USD",
      });
    });

    it("uses currency from first item", () => {
      const items: Money[] = [{ amount: 100, currency: "EUR" }];
      expect(totalWithTax(items, 0.2)).toEqual({
        amount: 120,
        currency: "EUR",
      });
    });

    it("rounds to 2 decimal places", () => {
      const items: Money[] = [{ amount: 33.33, currency: "USD" }];
      expect(totalWithTax(items, 0.1)).toEqual({
        amount: 36.66,
        currency: "USD",
      });
    });
  });

  describe("isRefundEligible", () => {
    it("returns true when order is within return window", () => {
      const orderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(orderDate)).toBe(true);
    });

    it("returns false when order is outside return window", () => {
      const orderDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(orderDate)).toBe(false);
    });

    it("supports fractional return window days", () => {
      const orderDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(orderDate, 0.5)).toBe(false);
    });

    it("defaults to 30-day window when returnWindowDays not provided", () => {
      const orderDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      expect(isRefundEligible(orderDate)).toBe(true);
    });
  });
});
