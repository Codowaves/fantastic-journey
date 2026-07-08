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

  it("rejects positive Infinity", () => {
    expect(() => processPayment({ amount: Infinity, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects negative Infinity", () => {
    expect(() =>
      processPayment({ amount: -Infinity, currency: "USD" }),
    ).toThrow(RangeError);
  });

  it("accepts fractional cents (e.g. 0.01)", () => {
    expect(processPayment({ amount: 0.01, currency: "USD" })).toEqual({
      amount: 0.01,
      currency: "USD",
    });
  });

  it("accepts very large finite amounts", () => {
    expect(
      processPayment({ amount: Number.MAX_SAFE_INTEGER, currency: "USD" }),
    ).toEqual({ amount: Number.MAX_SAFE_INTEGER, currency: "USD" });
  });

  it("preserves currency even when not USD", () => {
    expect(processPayment({ amount: 100, currency: "JPY" })).toEqual({
      amount: 100,
      currency: "JPY",
    });
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

  it("discounts a zero-amount price to zero", () => {
    expect(applyDiscount({ amount: 0, currency: "USD" }, 50)).toEqual({
      amount: 0,
      currency: "USD",
    });
  });

  it("handles a 50% discount cleanly", () => {
    expect(applyDiscount({ amount: 99.99, currency: "USD" }, 50)).toEqual({
      amount: 50,
      currency: "USD",
    });
  });

  it("handles a 33% discount (rounds 33.33 * 0.67 = 22.33)", () => {
    expect(applyDiscount({ amount: 33.33, currency: "USD" }, 33)).toEqual({
      amount: 22.33,
      currency: "USD",
    });
  });

  it("rounds to cents on a sub-cent price (0.001 -> 0.00)", () => {
    expect(applyDiscount({ amount: 0.001, currency: "USD" }, 10)).toEqual({
      amount: 0,
      currency: "USD",
    });
  });

  it("preserves non-USD currency", () => {
    expect(applyDiscount({ amount: 1000, currency: "JPY" }, 10)).toEqual({
      amount: 900,
      currency: "JPY",
    });
  });

  it("rejects percentOff of negative infinity", () => {
    expect(() =>
      applyDiscount({ amount: 10, currency: "USD" }, -Infinity),
    ).toThrow(RangeError);
  });

  it("rejects percentOff of positive infinity", () => {
    expect(() =>
      applyDiscount({ amount: 10, currency: "USD" }, Infinity),
    ).toThrow(RangeError);
  });

  it("does not throw on NaN percentOff (current behavior: NaN comparisons are false)", () => {
    expect(applyDiscount({ amount: 10, currency: "USD" }, NaN)).toEqual({
      amount: NaN,
      currency: "USD",
    });
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

  it("handles a single-item array", () => {
    expect(totalWithTax([{ amount: 10, currency: "USD" }], 0.1)).toEqual({
      amount: 11,
      currency: "USD",
    });
  });

  it("returns zero for an empty array even with non-zero tax", () => {
    expect(totalWithTax([], 0.0825)).toEqual({ amount: 0, currency: "USD" });
  });

  it("sums many items correctly", () => {
    const items: Money[] = Array.from({ length: 100 }, () => ({
      amount: 1,
      currency: "USD",
    }));
    expect(totalWithTax(items, 0)).toEqual({ amount: 100, currency: "USD" });
  });

  it("treats negative amounts as subtracting from the subtotal", () => {
    expect(
      totalWithTax(
        [
          { amount: 10, currency: "USD" },
          { amount: -3, currency: "USD" },
        ],
        0,
      ),
    ).toEqual({ amount: 7, currency: "USD" });
  });

  it("rounds half-up at the cent boundary (0.005 -> 0.01)", () => {
    expect(
      totalWithTax(
        [
          { amount: 0.01, currency: "USD" },
          { amount: 0.01, currency: "USD" },
        ],
        1.5,
      ),
    ).toEqual({ amount: 0.05, currency: "USD" });
  });

  it("applies a negative tax rate (discount) symmetrically", () => {
    expect(
      totalWithTax(
        [
          { amount: 100, currency: "USD" },
          { amount: 0, currency: "USD" },
        ],
        -0.1,
      ),
    ).toEqual({ amount: 90, currency: "USD" });
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

  it("returns false for a 1-day-old order with a 0-day window", () => {
    const oneDayAgo = new Date(Date.now() - MS_PER_DAY);
    expect(isRefundEligible(oneDayAgo, 0)).toBe(false);
  });

  it("returns false for any past order with a 0-day window", () => {
    const justNow = new Date();
    expect(isRefundEligible(justNow, 0)).toBe(false);
  });

  it("returns true for a future-dated order (clock skew / pre-orders)", () => {
    const future = new Date(Date.now() + 5 * MS_PER_DAY);
    expect(isRefundEligible(future)).toBe(true);
  });

  it("returns false for an order right at the 30-day boundary", () => {
    const justOverBoundary = new Date(Date.now() - 30 * MS_PER_DAY - 1);
    expect(isRefundEligible(justOverBoundary)).toBe(false);
  });

  it("returns true for an order just inside the 30-day boundary", () => {
    const justInside = new Date(Date.now() - 29 * MS_PER_DAY);
    expect(isRefundEligible(justInside)).toBe(true);
  });

  it("honors a fractional-day window (0.5 days ~= 12 hours)", () => {
    const thirteenHoursAgo = new Date(Date.now() - 13 * 60 * 60 * 1000);
    expect(isRefundEligible(thirteenHoursAgo, 0.5)).toBe(false);
  });
});
