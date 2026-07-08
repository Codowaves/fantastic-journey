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

  it("rejects Infinity", () => {
    expect(() => processPayment({ amount: Infinity, currency: "USD" })).toThrow(
      RangeError,
    );
  });

  it("rejects -Infinity", () => {
    expect(() =>
      processPayment({ amount: -Infinity, currency: "USD" }),
    ).toThrow(RangeError);
  });

  it("accepts a tiny positive subnormal amount", () => {
    expect(processPayment({ amount: 1e-10, currency: "USD" })).toEqual({
      amount: 1e-10,
      currency: "USD",
    });
  });

  it("accepts the smallest representable positive amount", () => {
    expect(
      processPayment({ amount: Number.MIN_VALUE, currency: "USD" }),
    ).toEqual({ amount: Number.MIN_VALUE, currency: "USD" });
  });

  it("preserves arbitrary currency strings", () => {
    expect(processPayment({ amount: 1, currency: "JPY" })).toEqual({
      amount: 1,
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

  it("preserves a non-USD currency", () => {
    expect(applyDiscount({ amount: 1000, currency: "JPY" }, 10)).toEqual({
      amount: 900,
      currency: "JPY",
    });
  });

  it("rounds half-up at the cent boundary", () => {
    // 9.99 * 0.33 = 3.2967 → 329.67 → /100 = 3.30
    expect(applyDiscount({ amount: 9.99, currency: "USD" }, 67)).toEqual({
      amount: 3.3,
      currency: "USD",
    });
  });

  it("rounds half-to-even at the exact .005 cent", () => {
    // 0.10 * 0.05 = 0.005 → 0.5 → /100 = 0.01 (round-half-to-even via Math.round)
    expect(applyDiscount({ amount: 0.1, currency: "USD" }, 95)).toEqual({
      amount: 0.01,
      currency: "USD",
    });
  });

  it("rounds down a sub-cent remainder to zero", () => {
    // 0.01 * (100-99) = 0.01 → Math.round(0.01) = 0 → 0/100 = 0
    expect(applyDiscount({ amount: 0.01, currency: "USD" }, 99)).toEqual({
      amount: 0,
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

  it("rounds the taxed total to cents", () => {
    // (0.333 + 0.333 + 0.333) * 1.0 = 0.999 → round → 1.00
    expect(
      totalWithTax(
        [
          { amount: 0.333, currency: "USD" },
          { amount: 0.333, currency: "USD" },
          { amount: 0.333, currency: "USD" },
        ],
        0,
      ),
    ).toEqual({ amount: 1, currency: "USD" });
  });

  it("uses only the first item's currency even when later items differ", () => {
    expect(
      totalWithTax(
        [
          { amount: 5, currency: "USD" },
          { amount: 5, currency: "EUR" },
        ],
        0,
      ),
    ).toEqual({ amount: 10, currency: "USD" });
  });

  it("applies a 100% tax rate by doubling the subtotal", () => {
    expect(
      totalWithTax(
        [
          { amount: 10, currency: "USD" },
          { amount: 5, currency: "USD" },
        ],
        1,
      ),
    ).toEqual({ amount: 30, currency: "USD" });
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

  it("returns false for an order placed just past the default window", () => {
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * MS_PER_DAY);
    expect(isRefundEligible(thirtyOneDaysAgo)).toBe(false);
  });

  it("returns true for a future order date", () => {
    const tomorrow = new Date(Date.now() + MS_PER_DAY);
    expect(isRefundEligible(tomorrow)).toBe(true);
  });

  it("returns true for a far-future order date", () => {
    const nextYear = new Date(Date.now() + 365 * MS_PER_DAY);
    expect(isRefundEligible(nextYear)).toBe(true);
  });

  it("returns false for a very old order", () => {
    const longAgo = new Date(Date.now() - 365 * MS_PER_DAY);
    expect(isRefundEligible(longAgo)).toBe(false);
  });

  it("treats a 0-day window as already expired", () => {
    const justNow = new Date();
    expect(isRefundEligible(justNow, 0)).toBe(false);
  });
});
