import { describe, expect, it } from "vitest";

import {
  applyDiscount,
  isRefundEligible,
  processPayment,
  totalWithTax,
  type Money,
} from "./payment";

describe("processPayment", () => {
  it("accepts a positive finite amount", () => {
    expect(processPayment({ amount: 10, currency: "USD" })).toEqual({
      amount: 10,
      currency: "USD",
    });
  });

  it("rejects zero", () => {
    expect(() => processPayment({ amount: 0, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects negative amounts", () => {
    expect(() => processPayment({ amount: -5, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects NaN", () => {
    expect(() => processPayment({ amount: NaN, currency: "USD" })).toThrow(
      RangeError,
    );
  });
});

describe("applyDiscount", () => {
  it("applies a 25% discount and rounds to cents", () => {
    expect(applyDiscount({ amount: 19.99, currency: "USD" }, 25)).toEqual({
      amount: 14.99,
      currency: "USD",
    });
  });

  it("returns the original amount when percentOff is 0", () => {
    expect(applyDiscount({ amount: 50, currency: "USD" }, 0)).toEqual({
      amount: 50,
      currency: "USD",
    });
  });

  it("returns zero amount when percentOff is 100", () => {
    expect(applyDiscount({ amount: 50, currency: "USD" }, 100)).toEqual({
      amount: 0,
      currency: "USD",
    });
  });

  it("rejects percentOff below 0", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow(
      RangeError,
    );
  });

  it("rejects percentOff above 100", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow(
      RangeError,
    );
  });
});

describe("totalWithTax", () => {
  it("sums multiple items and applies a tax rate, rounded to cents", () => {
    const items: Money[] = [
      { amount: 10, currency: "USD" },
      { amount: 5.5, currency: "USD" },
      { amount: 2.25, currency: "USD" },
    ];
    expect(totalWithTax(items, 0.1)).toEqual({
      amount: 19.53,
      currency: "USD",
    });
  });

  it("preserves the first item's currency", () => {
    expect(
      totalWithTax(
        [
          { amount: 10, currency: "EUR" },
          { amount: 5, currency: "EUR" },
        ],
        0,
      ),
    ).toEqual({ amount: 15, currency: "EUR" });
  });

  it("returns a zero USD total for an empty array", () => {
    expect(totalWithTax([], 0.1)).toEqual({ amount: 0, currency: "USD" });
  });

  it("applies a 0% tax rate as a pure sum", () => {
    expect(
      totalWithTax(
        [
          { amount: 1.11, currency: "USD" },
          { amount: 2.22, currency: "USD" },
        ],
        0,
      ),
    ).toEqual({ amount: 3.33, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  it("returns true for an order placed right now", () => {
    expect(isRefundEligible(new Date())).toBe(true);
  });

  it("returns true for an order within the default 30-day window", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * MS_PER_DAY);
    expect(isRefundEligible(tenDaysAgo)).toBe(true);
  });

  it("returns false for an order older than the default window", () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * MS_PER_DAY);
    expect(isRefundEligible(fortyDaysAgo)).toBe(false);
  });

  it("honors a custom return window", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * MS_PER_DAY);
    expect(isRefundEligible(fiveDaysAgo, 3)).toBe(false);
    expect(isRefundEligible(fiveDaysAgo, 7)).toBe(true);
  });
});
