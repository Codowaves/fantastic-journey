import { describe, expect, it } from "vitest";
import { applyDiscount, totalWithTax, isRefundEligible, type Money } from "../src/payment.js";

describe("applyDiscount", () => {
  it("should apply 100% discount (boundary case)", () => {
    const price: Money = { amount: 10, currency: "USD" };
    const result = applyDiscount(price, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should apply 0% discount", () => {
    const price: Money = { amount: 10, currency: "USD" };
    const result = applyDiscount(price, 0);
    expect(result).toEqual({ amount: 10, currency: "USD" });
  });

  it("should apply 50% discount", () => {
    const price: Money = { amount: 100, currency: "EUR" };
    const result = applyDiscount(price, 50);
    expect(result).toEqual({ amount: 50, currency: "EUR" });
  });

  it("should apply 25% discount", () => {
    const price: Money = { amount: 100, currency: "USD" };
    const result = applyDiscount(price, 25);
    expect(result).toEqual({ amount: 75, currency: "USD" });
  });

  it("should preserve currency", () => {
    const price: Money = { amount: 50, currency: "GBP" };
    const result = applyDiscount(price, 10);
    expect(result.currency).toBe("GBP");
  });

  it("should throw RangeError for negative percentOff", () => {
    const price: Money = { amount: 10, currency: "USD" };
    expect(() => applyDiscount(price, -1)).toThrow(RangeError);
    expect(() => applyDiscount(price, -1)).toThrow("percentOff must be 0–100");
  });

  it("should throw RangeError for percentOff > 100", () => {
    const price: Money = { amount: 10, currency: "USD" };
    expect(() => applyDiscount(price, 101)).toThrow(RangeError);
    expect(() => applyDiscount(price, 101)).toThrow("percentOff must be 0–100");
  });
});

describe("totalWithTax", () => {
  it("should calculate total with tax for single item", () => {
    const items: Money[] = [{ amount: 100, currency: "USD" }];
    const result = totalWithTax(items, 0.1); // 10% tax
    expect(result).toEqual({ amount: 110, currency: "USD" });
  });

  it("should calculate total with tax for multiple items", () => {
    const items: Money[] = [
      { amount: 100, currency: "USD" },
      { amount: 50, currency: "USD" },
    ];
    const result = totalWithTax(items, 0.2); // 20% tax
    expect(result).toEqual({ amount: 180, currency: "USD" });
  });

  it("should return zero amount for empty items", () => {
    const result = totalWithTax([], 0.1);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("should preserve currency from first item", () => {
    const items: Money[] = [{ amount: 100, currency: "EUR" }];
    const result = totalWithTax(items, 0.15);
    expect(result.currency).toBe("EUR");
  });
});

describe("isRefundEligible", () => {
  it("should return true for recent order", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isRefundEligible(yesterday, 30)).toBe(true);
  });

  it("should return false for old order", () => {
    const longAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(longAgo, 30)).toBe(false);
  });

  it("should use default 30-day window", () => {
    const day29 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    const day31 = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(day29)).toBe(true);
    expect(isRefundEligible(day31)).toBe(false);
  });

  it("should respect custom return window", () => {
    const day10 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(isRefundEligible(day10, 7)).toBe(false);
    expect(isRefundEligible(day10, 15)).toBe(true);
  });
});
