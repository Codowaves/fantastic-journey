import { describe, it, expect } from "vitest";
import { discountedPrice } from "./seed-discount2";

describe("discountedPrice", () => {
  it("20% off 100 = 80", () => {
    expect(discountedPrice(100, 20)).toBe(80);
  });

  it("0% = same", () => {
    expect(discountedPrice(40, 0)).toBe(40);
  });

  it("100% off = 0", () => {
    expect(discountedPrice(50, 100)).toBe(0);
  });

  it("50% off 200 = 100", () => {
    expect(discountedPrice(200, 50)).toBe(100);
  });

  it("original price 0 yields 0", () => {
    expect(discountedPrice(0, 25)).toBe(0);
  });

  it("non-integer percentage off 100 = 75", () => {
    expect(discountedPrice(100, 25.5)).toBeCloseTo(74.5);
  });

  it("fractional original price", () => {
    expect(discountedPrice(9.99, 10)).toBeCloseTo(8.991);
  });

  it("handles negative discount percentage (price increases)", () => {
    expect(discountedPrice(100, -10)).toBe(110);
  });

  it("handles discount percentage above 100 (negative price)", () => {
    expect(discountedPrice(100, 150)).toBe(-50);
  });

  it("returns NaN when pct is NaN", () => {
    expect(Number.isNaN(discountedPrice(100, NaN))).toBe(true);
  });

  it("returns NaN when price is NaN", () => {
    expect(Number.isNaN(discountedPrice(NaN, 20))).toBe(true);
  });

  it("Infinity price yields NaN (Infinity - Infinity)", () => {
    expect(Number.isNaN(discountedPrice(Infinity, 10))).toBe(true);
  });

  it("Infinity price with 0% yields NaN (Infinity*0 is NaN)", () => {
    expect(Number.isNaN(discountedPrice(Infinity, 0))).toBe(true);
  });
});
