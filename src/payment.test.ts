import { afterEach, describe, expect, it, vi } from "vitest";

import { applyDiscount, isRefundEligible, totalWithTax } from "./payment";

describe("applyDiscount", () => {
  it("reduces the price by the given percentage", () => {
    expect(applyDiscount({ amount: 100, currency: "USD" }, 25)).toEqual({
      amount: 75,
      currency: "USD",
    });
  });

  it("throws a RangeError when percentOff is outside 0–100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow(
      RangeError,
    );
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow(
      RangeError,
    );
  });
});

describe("totalWithTax", () => {
  it("sums the item amounts and applies the tax rate", () => {
    expect(
      totalWithTax(
        [
          { amount: 10, currency: "USD" },
          { amount: 20, currency: "USD" },
        ],
        0.1,
      ),
    ).toEqual({ amount: 33, currency: "USD" });
  });

  it("returns a zero USD total for an empty item list", () => {
    expect(totalWithTax([], 0.2)).toEqual({ amount: 0, currency: "USD" });
  });
});

describe("isRefundEligible", () => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is eligible for an order placed within the return window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T00:00:00.000Z"));

    const orderDate = new Date(Date.now() - 10 * DAY_MS);

    expect(isRefundEligible(orderDate)).toBe(true);
  });

  it("is not eligible once the order reaches the returnWindowDays boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T00:00:00.000Z"));

    const exactlyAtWindow = new Date(Date.now() - 30 * DAY_MS);
    const justInsideWindow = new Date(Date.now() - 30 * DAY_MS + 1);

    expect(isRefundEligible(exactlyAtWindow)).toBe(false);
    expect(isRefundEligible(justInsideWindow)).toBe(true);
  });
});
