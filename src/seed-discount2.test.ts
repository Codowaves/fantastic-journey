import { describe, it, expect } from "vitest";
import { discountedPrice } from "./seed-discount2";

describe("discountedPrice", () => {
  it("applies a 20% discount to 100 -> 80", () => {
    expect(discountedPrice(100, 20)).toBe(80);
  });

  it("returns the same price for 0% discount", () => {
    expect(discountedPrice(40, 0)).toBe(40);
  });

  it("returns 0 for a 100% discount", () => {
    expect(discountedPrice(50, 100)).toBe(0);
  });

  it("returns a negative price when discount exceeds 100%", () => {
    expect(discountedPrice(50, 150)).toBe(-25);
  });

  it("returns the price unchanged when pct is negative (surplus)", () => {
    expect(discountedPrice(100, -10)).toBe(110);
  });

  it("handles a zero price", () => {
    expect(discountedPrice(0, 20)).toBe(0);
  });

  it("handles a 50% discount on an odd price", () => {
    expect(discountedPrice(99, 50)).toBe(49.5);
  });

  it("handles fractional discount percentages", () => {
    expect(discountedPrice(200, 12.5)).toBe(175);
  });

  it("handles very small prices", () => {
    expect(discountedPrice(0.01, 10)).toBeCloseTo(0.009);
  });

  it("handles very large prices", () => {
    expect(discountedPrice(1e9, 10)).toBe(9e8);
  });

  it("preserves the price for a 0% discount regardless of magnitude", () => {
    expect(discountedPrice(1e9, 0)).toBe(1e9);
  });
});
