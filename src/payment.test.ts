import { afterEach, describe, expect, it, vi } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("payment helpers", () => {
  describe("applyDiscount", () => {
    it("subtracts the percentage off and rounds to two decimals", () => {
      expect(applyDiscount({ amount: 100, currency: "USD" }, 25)).toEqual({
        amount: 75,
        currency: "USD",
      });
    });

    it("throws RangeError when percentOff is outside 0–100", () => {
      expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(
        RangeError,
      );
    });
  });

  describe("totalWithTax", () => {
    it("sums the items and applies the tax rate using the first currency", () => {
      const items = [
        { amount: 10, currency: "EUR" },
        { amount: 30, currency: "EUR" },
      ];

      expect(totalWithTax(items, 0.1)).toEqual({ amount: 44, currency: "EUR" });
    });

    it("returns a zero USD total for an empty items array", () => {
      expect(totalWithTax([], 0.2)).toEqual({ amount: 0, currency: "USD" });
    });
  });

  describe("isRefundEligible", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("is eligible for an order placed inside the return window", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-29T00:00:00.000Z"));

      const tenDaysAgo = new Date("2026-05-19T00:00:00.000Z");
      expect(isRefundEligible(tenDaysAgo)).toBe(true);
    });

    it("is not eligible at the exact return-window boundary", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-29T00:00:00.000Z"));

      const exactlyThirtyDaysAgo = new Date("2026-04-29T00:00:00.000Z");
      expect(isRefundEligible(exactlyThirtyDaysAgo)).toBe(false);
    });
  });
});
