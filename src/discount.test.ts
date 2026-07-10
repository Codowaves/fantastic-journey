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

  describe("error/throw paths", () => {
    it("does not throw on a normal positive price and percent", () => {
      expect(() => applyDiscount(100, 20)).not.toThrow();
    });

    it("does not throw on a 0% discount", () => {
      expect(() => applyDiscount(100, 0)).not.toThrow();
    });

    it("does not throw on a 100% discount", () => {
      expect(() => applyDiscount(100, 100)).not.toThrow();
    });

    it("does not throw on a zero price", () => {
      expect(() => applyDiscount(0, 50)).not.toThrow();
    });

    it("does not throw on a negative percent (price markup)", () => {
      expect(() => applyDiscount(100, -10)).not.toThrow();
    });

    it("does not throw on a percent greater than 100 (negative result)", () => {
      expect(() => applyDiscount(100, 150)).not.toThrow();
    });

    it("does not throw on a negative price", () => {
      // Functionally undefined behavior — but it must not throw.
      expect(() => applyDiscount(-100, 20)).not.toThrow();
    });
  });

  describe("edge / degenerate inputs", () => {
    it("returns the original price when percent is 0", () => {
      expect(applyDiscount(0, 0)).toBe(0);
      expect(applyDiscount(42, 0)).toBe(42);
    });

    it("returns 0 when percent is 100", () => {
      expect(applyDiscount(0, 100)).toBe(0);
      expect(applyDiscount(99.99, 100)).toBe(0);
    });

    it("returns a negative result when percent exceeds 100", () => {
      // 100 - (100 * 150) / 100 = -50
      expect(applyDiscount(100, 150)).toBe(-50);
    });

    it("returns a value greater than the original price when percent is negative", () => {
      // 100 - (100 * -10) / 100 = 110
      expect(applyDiscount(100, -10)).toBe(110);
    });

    it("propagates NaN when price is NaN", () => {
      expect(Number.isNaN(applyDiscount(Number.NaN, 20))).toBe(true);
    });

    it("propagates NaN when percent is NaN", () => {
      expect(Number.isNaN(applyDiscount(100, Number.NaN))).toBe(true);
    });

    it("returns NaN on an infinite price with any non-zero finite percent", () => {
      // IEEE-754: Infinity * finite = Infinity, then Infinity - Infinity = NaN.
      expect(Number.isNaN(applyDiscount(Number.POSITIVE_INFINITY, 20))).toBe(
        true,
      );
      expect(Number.isNaN(applyDiscount(Number.NEGATIVE_INFINITY, 50))).toBe(
        true,
      );
    });

    it("returns 0 when percent is 100 on a negative price", () => {
      // -100 - (-100 * 100) / 100 = -100 - (-100) = 0
      expect(applyDiscount(-100, 100)).toBe(0);
    });

    it("returns NaN when percent is 100 on a positive-infinity price", () => {
      // Infinity - (Infinity * 100) / 100 = Infinity - Infinity = NaN
      // (IEEE-754: Infinity minus Infinity is NaN)
      expect(Number.isNaN(applyDiscount(Number.POSITIVE_INFINITY, 100))).toBe(
        true,
      );
    });

    it("returns NaN when percent is 0 on a positive-infinity price", () => {
      // Algebraically: Infinity - 0 = Infinity. But IEEE-754 evaluates the
      // subexpression `Infinity * 0` first, which is NaN, and NaN poisons
      // the whole expression.
      expect(Number.isNaN(applyDiscount(Number.POSITIVE_INFINITY, 0))).toBe(
        true,
      );
    });
  });

  describe("floating-point precision", () => {
    it("handles fractional percents", () => {
      // 10 - (10 * 7.5) / 100 = 9.25
      expect(applyDiscount(10, 7.5)).toBe(9.25);
    });

    it("handles fractional prices", () => {
      // 19.99 - (19.99 * 10) / 100 = 17.991
      expect(applyDiscount(19.99, 10)).toBeCloseTo(17.991, 10);
    });

    it("handles a 33.33% discount on 9.99", () => {
      // 9.99 - (9.99 * 33.33) / 100 = 6.660333
      expect(applyDiscount(9.99, 33.33)).toBeCloseTo(6.660333, 10);
    });

    it("does not lose precision for a 50% discount on a power-of-two price", () => {
      expect(applyDiscount(1024, 50)).toBe(512);
    });
  });

  describe("symmetry / algebraic properties", () => {
    it("a 100% discount after any discount on the original yields 0", () => {
      // applyDiscount(applyDiscount(100, 50), 100) === 0
      const discounted = applyDiscount(100, 50);
      expect(applyDiscount(discounted, 100)).toBe(0);
    });

    it("a 0% discount on a discounted price is a no-op", () => {
      const discounted = applyDiscount(100, 25);
      expect(applyDiscount(discounted, 0)).toBe(discounted);
    });

    it("chained discounts compose multiplicatively (not additively)", () => {
      // Two sequential 50% discounts give 25, not 0.
      const once = applyDiscount(100, 50);
      const twice = applyDiscount(once, 50);
      expect(twice).toBe(25);
    });

    it("a -100% discount doubles the price", () => {
      expect(applyDiscount(100, -100)).toBe(200);
    });
  });

  describe("type-like behaviour with non-finite operands", () => {
    it("returns NaN when both operands are NaN", () => {
      expect(Number.isNaN(applyDiscount(Number.NaN, Number.NaN))).toBe(true);
    });

    it("NaN result is distinguishable from a finite result", () => {
      const finite = applyDiscount(100, 25);
      const nanResult = applyDiscount(100, Number.NaN);
      expect(Number.isFinite(finite)).toBe(true);
      expect(Number.isNaN(nanResult)).toBe(true);
    });
  });
});
