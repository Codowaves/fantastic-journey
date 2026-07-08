import { describe, expect, it } from "vitest";

import { discountedPrice } from "./seed-discount2";

describe("discountedPrice", () => {
  it("20% off 100 = 80", () => {
    expect(discountedPrice(100, 20)).toBe(80);
  });

  it("0% = same", () => {
    expect(discountedPrice(40, 0)).toBe(40);
  });

  describe("edge cases", () => {
    it("returns 0 for a zero price regardless of discount", () => {
      expect(discountedPrice(0, 20)).toBe(0);
      expect(discountedPrice(0, 100)).toBe(0);
      expect(discountedPrice(0, 0)).toBe(0);
    });

    it("returns 0 when the discount is 100%", () => {
      expect(discountedPrice(50, 100)).toBe(0);
    });

    it("returns a negative price when the discount exceeds 100%", () => {
      expect(discountedPrice(100, 150)).toBe(-50);
    });

    it("applies a negative discount by increasing the price", () => {
      expect(discountedPrice(100, -20)).toBe(120);
    });

    it("applies a negative discount to a zero price", () => {
      expect(discountedPrice(0, -50)).toBe(0);
    });

    it("handles a negative price with a positive discount", () => {
      expect(discountedPrice(-100, 20)).toBe(-80);
    });

    it("handles a negative price with a negative discount (adds to the negative)", () => {
      expect(discountedPrice(-100, -20)).toBe(-120);
    });

    it("preserves fractional prices and percentages", () => {
      expect(discountedPrice(19.99, 12.5)).toBeCloseTo(17.49125, 5);
    });

    it("preserves very small percentages", () => {
      expect(discountedPrice(1000, 0.01)).toBeCloseTo(999.9, 5);
    });

    it("NaN price produces NaN", () => {
      expect(Number.isNaN(discountedPrice(NaN, 20))).toBe(true);
    });

    it("NaN percentage produces NaN", () => {
      expect(Number.isNaN(discountedPrice(100, NaN))).toBe(true);
    });

    it("Infinity price with a finite percentage yields NaN (Infinity - Infinity)", () => {
      expect(Number.isNaN(discountedPrice(Infinity, 10))).toBe(true);
    });

    it("Infinity percentage with a finite price yields -Infinity", () => {
      expect(discountedPrice(100, Infinity)).toBe(-Infinity);
    });
  });
});
