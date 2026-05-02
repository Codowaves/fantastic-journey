import { applyDiscount } from "../src/payment";
import { describe, it, expect } from "vitest";

describe("applyDiscount", () => {
  it("handles 100% off (full discount)", () => {
    const result = applyDiscount({ amount: 10, currency: "USD" }, 100);
    expect(result).toEqual({ amount: 0, currency: "USD" });
  });

  it("handles 0% off (no discount)", () => {
    const result = applyDiscount({ amount: 100, currency: "USD" }, 0);
    expect(result).toEqual({ amount: 100, currency: "USD" });
  });

  it("rejects negative percentOff", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, -1)).toThrow();
  });

  it("rejects percentOff over 100", () => {
    expect(() => applyDiscount({ amount: 10, currency: "USD" }, 101)).toThrow();
  });
});