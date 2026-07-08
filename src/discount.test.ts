import { describe, it, expect } from "vitest";
import { applyDiscount } from "./discount";

describe("applyDiscount", () => {
  it("applies a 20% discount", () => {
    expect(applyDiscount(100, 20)).toBe(80);
  });
  it("applies a 0% discount", () => {
    expect(applyDiscount(50, 0)).toBe(50);
  });
  it("applies a 100% discount", () => {
    expect(applyDiscount(100, 100)).toBe(0);
  });

  describe("error/throw branches", () => {
    it("throws RangeError when price is NaN", () => {
      expect(() => applyDiscount(Number.NaN, 20)).toThrow(RangeError);
      expect(() => applyDiscount(Number.NaN, 20)).toThrow(
        /price must be a finite number/,
      );
    });

    it("throws RangeError when price is positive Infinity", () => {
      expect(() => applyDiscount(Number.POSITIVE_INFINITY, 20)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount(Number.POSITIVE_INFINITY, 20)).toThrow(
        /price must be a finite number/,
      );
    });

    it("throws RangeError when price is negative Infinity", () => {
      expect(() => applyDiscount(Number.NEGATIVE_INFINITY, 20)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount(Number.NEGATIVE_INFINITY, 20)).toThrow(
        /price must be a finite number/,
      );
    });

    it("throws RangeError when percent is NaN", () => {
      expect(() => applyDiscount(100, Number.NaN)).toThrow(RangeError);
      expect(() => applyDiscount(100, Number.NaN)).toThrow(
        /percent must be a finite number/,
      );
    });

    it("throws RangeError when percent is positive Infinity", () => {
      expect(() => applyDiscount(100, Number.POSITIVE_INFINITY)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount(100, Number.POSITIVE_INFINITY)).toThrow(
        /percent must be a finite number/,
      );
    });

    it("throws RangeError when percent is negative Infinity", () => {
      expect(() => applyDiscount(100, Number.NEGATIVE_INFINITY)).toThrow(
        RangeError,
      );
      expect(() => applyDiscount(100, Number.NEGATIVE_INFINITY)).toThrow(
        /percent must be a finite number/,
      );
    });

    it("throws RangeError before computing when both inputs are non-finite", () => {
      expect(() => applyDiscount(Number.NaN, Number.NaN)).toThrow(RangeError);
      expect(() => applyDiscount(Number.POSITIVE_INFINITY, Number.NaN)).toThrow(
        RangeError,
      );
    });

    it("does not throw on valid finite inputs", () => {
      expect(() => applyDiscount(100, 20)).not.toThrow();
      expect(() => applyDiscount(0, 50)).not.toThrow();
      expect(() => applyDiscount(50, 0)).not.toThrow();
    });

    it("does not throw on negative percent (increase) or percent > 100 (negative result)", () => {
      expect(() => applyDiscount(100, -10)).not.toThrow();
      expect(() => applyDiscount(100, 150)).not.toThrow();
      expect(applyDiscount(100, -10)).toBe(110);
      expect(applyDiscount(100, 150)).toBe(-50);
    });

    it("does not throw on zero price", () => {
      expect(() => applyDiscount(0, 50)).not.toThrow();
      expect(applyDiscount(0, 50)).toBe(0);
    });

    it("does not throw on negative price", () => {
      expect(() => applyDiscount(-100, 20)).not.toThrow();
      expect(applyDiscount(-100, 20)).toBe(-80);
    });
  });
});
