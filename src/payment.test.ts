import { describe, it, expect } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible } from "./payment.js";

describe("applyDiscount", () => {
  it("applies 0% discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 0);
    expect(result.amount).toBe(100);
  });

  it("applies 50% discount", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 50);
    expect(result.amount).toBe(50);
  });

  it("preserves currency", () => {
    const result = applyDiscount({ amount: 100, currency: "EUR" }, 10);
    expect(result.currency).toBe("EUR");
  });

  it("rounds to 2 decimal places", () => {
    const result = applyDiscount({ amount: 99, currency: "USD" }, 33);
    expect(result.amount).toBe(66.33);
  });

  it("throws on negative percent", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, -1)).toThrow();
  });

  it("throws on percent over 100", () => {
    expect(() => applyDiscount({ amount: 100, currency: "USD" }, 101)).toThrow();
  });
});

describe("totalWithTax", () => {
  it("returns zero for empty array", () => {
    const result = totalWithTax([], 0.1);
    expect(result.amount).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("sums amounts with tax", () => {
    const result = totalWithTax(
      [
        { amount: 100, currency: "USD" },
        { amount: 50, currency: "USD" },
      ],
      0.1
    );
    expect(result.amount).toBe(165);
  });

  it("uses first item currency", () => {
    const result = totalWithTax([{ amount: 100, currency: "EUR" }], 0.2);
    expect(result.currency).toBe("EUR");
  });

  it("rounds to 2 decimal places", () => {
    const result = totalWithTax([{ amount: 33.33, currency: "USD" }], 0.1);
    expect(result.amount).toBe(36.66);
  });
});

describe("isRefundEligible", () => {
  it("is eligible within window", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(recent)).toBe(true);
  });

  it("is not eligible outside window", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(old)).toBe(false);
  });

  it("respects custom window", () => {
    const day15 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(day15, 30)).toBe(true);
    expect(isRefundEligible(day15, 10)).toBe(false);
  });
});