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

  describe("error/edge-case paths", () => {
    describe("boundary percent values", () => {
      it("does not throw for percent = 0", () => {
        expect(() => applyDiscount(100, 0)).not.toThrow();
      });

      it("does not throw for percent = 100", () => {
        expect(() => applyDiscount(100, 100)).not.toThrow();
      });

      it("does not throw for a negative percent (mathematically invalid for a discount)", () => {
        // Negative percent would increase the price; lock in the current
        // behavior (it does not throw and computes a higher value).
        expect(() => applyDiscount(100, -20)).not.toThrow();
      });

      it("does not throw for a percent greater than 100 (over-discount)", () => {
        expect(() => applyDiscount(100, 150)).not.toThrow();
      });

      it("applies a negative percent: percent = -50 yields a 50% markup", () => {
        expect(applyDiscount(100, -50)).toBe(150);
      });

      it("applies a percent greater than 100: percent = 200 drives the price negative", () => {
        // 100 - (100 * 200) / 100 = 100 - 200 = -100
        expect(applyDiscount(100, 200)).toBe(-100);
      });

      it("percent = -Infinity yields +Infinity (does not throw)", () => {
        const result = applyDiscount(100, Number.NEGATIVE_INFINITY);
        expect(result).toBe(Number.POSITIVE_INFINITY);
      });

      it("percent = +Infinity yields -Infinity (does not throw)", () => {
        const result = applyDiscount(100, Number.POSITIVE_INFINITY);
        expect(result).toBe(Number.NEGATIVE_INFINITY);
      });
    });

    describe("negative price inputs", () => {
      it("does not throw for a negative price", () => {
        expect(() => applyDiscount(-100, 20)).not.toThrow();
      });

      it("applies a 20% discount to a negative price (yields a more-negative price)", () => {
        // -100 - (-100 * 20) / 100 = -100 - (-20) = -80
        expect(applyDiscount(-100, 20)).toBe(-80);
      });

      it("applies a 100% discount to a negative price (yields 0)", () => {
        expect(applyDiscount(-100, 100)).toBe(0);
      });

      it("applies a 0% discount to a negative price (price is unchanged)", () => {
        expect(applyDiscount(-100, 0)).toBe(-100);
      });
    });

    describe("zero inputs", () => {
      it("returns 0 for price = 0 regardless of percent", () => {
        expect(applyDiscount(0, 20)).toBe(0);
        expect(applyDiscount(0, 50)).toBe(0);
        expect(applyDiscount(0, 100)).toBe(0);
      });

      it("returns price for percent = 0 regardless of price", () => {
        expect(applyDiscount(0, 0)).toBe(0);
        expect(applyDiscount(42, 0)).toBe(42);
        expect(applyDiscount(-42, 0)).toBe(-42);
      });

      it("does not throw when both arguments are 0", () => {
        expect(() => applyDiscount(0, 0)).not.toThrow();
      });

      it("returns 0 when price is -0", () => {
        // -0 - (-0 * 20) / 100 === +0 (the arithmetic collapses to +0).
        expect(Object.is(applyDiscount(-0, 20), 0)).toBe(true);
        expect(applyDiscount(-0, 20)).toBe(0);
      });

      it("treats -0 as 0 for percent", () => {
        // -0 === 0 in arithmetic, so percent = -0 acts like 0%.
        expect(applyDiscount(100, -0)).toBe(100);
      });
    });

    describe("NaN inputs", () => {
      it("returns NaN when price is NaN", () => {
        expect(Number.isNaN(applyDiscount(Number.NaN, 20))).toBe(true);
      });

      it("returns NaN when percent is NaN", () => {
        expect(Number.isNaN(applyDiscount(100, Number.NaN))).toBe(true);
      });

      it("returns NaN when both arguments are NaN", () => {
        expect(Number.isNaN(applyDiscount(Number.NaN, Number.NaN))).toBe(true);
      });

      it("does not throw on NaN inputs", () => {
        expect(() => applyDiscount(Number.NaN, 20)).not.toThrow();
        expect(() => applyDiscount(20, Number.NaN)).not.toThrow();
        expect(() => applyDiscount(Number.NaN, Number.NaN)).not.toThrow();
      });
    });

    describe("Infinity inputs", () => {
      it("returns NaN when price is +Infinity (any percent)", () => {
        // Infinity * percent = Infinity (or NaN at 0%), and Infinity - Infinity = NaN
        expect(Number.isNaN(applyDiscount(Number.POSITIVE_INFINITY, 20))).toBe(
          true,
        );
      });

      it("returns NaN when price is -Infinity", () => {
        expect(Number.isNaN(applyDiscount(Number.NEGATIVE_INFINITY, 20))).toBe(
          true,
        );
      });

      it("does not throw on Infinity price inputs", () => {
        expect(() => applyDiscount(Number.POSITIVE_INFINITY, 20)).not.toThrow();
        expect(() => applyDiscount(Number.NEGATIVE_INFINITY, 20)).not.toThrow();
      });
    });

    describe("floating-point precision", () => {
      it("does not lose precision on a normal positive price", () => {
        // 100 * 33.33 / 100 = 33.33 (with floating-point math the
        // residue is in the last few decimal digits).
        expect(applyDiscount(100, 33.33)).toBeCloseTo(66.67, 5);
      });

      it("handles a very small percent", () => {
        expect(applyDiscount(1000, 0.01)).toBeCloseTo(999.9, 10);
      });

      it("handles a fractional percent", () => {
        expect(applyDiscount(99.99, 12.5)).toBeCloseTo(87.49125, 10);
      });
    });

    describe("non-number inputs (TypeScript `as unknown` casts at the boundary)", () => {
      it("does not throw when price is null (coerces to 0)", () => {
        // null coerces to 0, percent still applies.
        expect(() =>
          applyDiscount(null as unknown as number, 20),
        ).not.toThrow();
      });

      it("returns 0 when price is null", () => {
        // null coerces to 0 in numeric arithmetic.
        expect(applyDiscount(null as unknown as number, 20)).toBe(0);
      });

      it("returns NaN when percent is undefined (coerces to NaN)", () => {
        expect(
          Number.isNaN(applyDiscount(100, undefined as unknown as number)),
        ).toBe(true);
      });

      it("does not throw when percent is undefined", () => {
        expect(() =>
          applyDiscount(100, undefined as unknown as number),
        ).not.toThrow();
      });

      it("returns NaN when price is a non-numeric string", () => {
        expect(
          Number.isNaN(applyDiscount("abc" as unknown as number, 20)),
        ).toBe(true);
      });

      it("coerces a numeric string for price", () => {
        // "200" coerces to 200, and 200 - (200*20)/100 = 160.
        expect(applyDiscount("200" as unknown as number, 20)).toBe(160);
      });

      it("returns NaN when price is an object (toString-derived number)", () => {
        // {} coerces to NaN, so the result is NaN.
        expect(Number.isNaN(applyDiscount({} as unknown as number, 20))).toBe(
          true,
        );
      });

      it("does not throw when price is an object", () => {
        expect(() => applyDiscount({} as unknown as number, 20)).not.toThrow();
      });

      it("does not throw when percent is an object", () => {
        expect(() => applyDiscount(100, {} as unknown as number)).not.toThrow();
      });

      it("does not throw when price is a boolean", () => {
        expect(() =>
          applyDiscount(true as unknown as number, 20),
        ).not.toThrow();
      });
    });

    describe("does-not-throw regression guarantees", () => {
      it("does not throw on a normal, well-formed input", () => {
        expect(() => applyDiscount(100, 20)).not.toThrow();
      });

      it("does not throw on negative price with normal percent", () => {
        expect(() => applyDiscount(-50, 10)).not.toThrow();
      });

      it("does not throw on normal price with negative percent", () => {
        expect(() => applyDiscount(50, -10)).not.toThrow();
      });

      it("does not throw on the largest safe integer", () => {
        expect(() => applyDiscount(Number.MAX_SAFE_INTEGER, 5)).not.toThrow();
      });

      it("does not throw on the smallest safe integer", () => {
        expect(() => applyDiscount(Number.MIN_SAFE_INTEGER, 5)).not.toThrow();
      });
    });
  });
});
