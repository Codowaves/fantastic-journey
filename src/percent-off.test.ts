import { describe, it, expect } from "vitest";
import { percentOff } from "./percent-off";
describe("percentOff", () => {
  it("takes 20% off 100", () => expect(percentOff(100, 20)).toBe(80));
  it("takes 0% off 50", () => expect(percentOff(50, 0)).toBe(50));
  it("takes 100% off 100", () => expect(percentOff(100, 100)).toBe(0));

  describe("zero-price branch (price === 0)", () => {
    it("returns 0 for any discount when price is 0", () => {
      expect(percentOff(0, 20)).toBe(0);
      expect(percentOff(0, 50)).toBe(0);
      expect(percentOff(0, 100)).toBe(0);
    });

    it("returns 0 when both price and pct are 0", () => {
      expect(percentOff(0, 0)).toBe(0);
    });

    it("returns 0 for negative percentages when price is 0", () => {
      expect(percentOff(0, -50)).toBe(0);
    });
  });

  describe("negative-percentage branch (markup / surcharge)", () => {
    it("adds 10% when pct is -10 on a price of 100", () => {
      expect(percentOff(100, -10)).toBe(110);
    });

    it("doubles the price when pct is -100", () => {
      expect(percentOff(50, -100)).toBe(100);
    });

    it("preserves precision on a small price with negative percentage", () => {
      expect(percentOff(1, -50)).toBe(1.5);
    });
  });

  describe("percentage > 100 branch (over-discount → negative price)", () => {
    it("returns a negative number when pct exceeds 100", () => {
      expect(percentOff(100, 150)).toBe(-50);
    });

    it("returns a negative number when pct equals 200", () => {
      expect(percentOff(50, 200)).toBe(-50);
    });
  });

  describe("non-integer percentage branch (floating-point input)", () => {
    it("applies a 12.5% discount correctly", () => {
      expect(percentOff(200, 12.5)).toBe(175);
    });

    it("applies a 33.333...% discount without throwing", () => {
      const result = percentOff(100, 100 / 3);
      expect(result).toBeCloseTo(66.66666666666666, 10);
      expect(() => percentOff(100, 100 / 3)).not.toThrow();
    });

    it("applies a fractional percent like 0.5%", () => {
      expect(percentOff(200, 0.5)).toBe(199);
    });
  });

  describe("NaN inputs (error-path through arithmetic)", () => {
    it("returns NaN when price is NaN", () => {
      const result = percentOff(Number.NaN, 20);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("returns NaN when pct is NaN", () => {
      const result = percentOff(100, Number.NaN);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("returns NaN when both inputs are NaN", () => {
      const result = percentOff(Number.NaN, Number.NaN);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("does not throw on NaN inputs", () => {
      expect(() => percentOff(Number.NaN, 20)).not.toThrow();
      expect(() => percentOff(100, Number.NaN)).not.toThrow();
    });
  });

  describe("Infinity inputs (error-path through arithmetic)", () => {
    it("returns NaN when price is Infinity and pct is 50 (Infinity - Infinity = NaN)", () => {
      expect(Number.isNaN(percentOff(Number.POSITIVE_INFINITY, 50))).toBe(true);
    });

    it("returns NaN when price is Infinity and pct is 100", () => {
      expect(Number.isNaN(percentOff(Number.POSITIVE_INFINITY, 100))).toBe(
        true,
      );
    });

    it("returns -Infinity when price is finite and pct is Infinity", () => {
      expect(percentOff(100, Number.POSITIVE_INFINITY)).toBe(
        Number.NEGATIVE_INFINITY,
      );
    });

    it("returns Infinity when price is finite and pct is negative Infinity", () => {
      expect(percentOff(100, Number.NEGATIVE_INFINITY)).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("does not throw on Infinity inputs", () => {
      expect(() => percentOff(Number.POSITIVE_INFINITY, 50)).not.toThrow();
      expect(() => percentOff(100, Number.POSITIVE_INFINITY)).not.toThrow();
      expect(() =>
        percentOff(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      ).not.toThrow();
    });
  });

  describe("floating-point precision branch", () => {
    it("handles a discount that produces a repeating-decimal result without throwing", () => {
      // 19.99 * 0.15 is a classic floating-point edge case.
      const result = percentOff(19.99, 15);
      expect(typeof result).toBe("number");
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeCloseTo(16.9915, 4);
    });

    it("returns an exact result for clean integer math", () => {
      expect(percentOff(99.99, 10)).toBe(89.991);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on normal inputs", () => {
      expect(() => percentOff(100, 20)).not.toThrow();
      expect(() => percentOff(0, 50)).not.toThrow();
      expect(() => percentOff(100, 0)).not.toThrow();
    });

    it("does not throw on degenerate arithmetic inputs", () => {
      expect(() => percentOff(Number.NaN, Number.NaN)).not.toThrow();
      expect(() =>
        percentOff(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      ).not.toThrow();
      expect(() => percentOff(Number.NEGATIVE_INFINITY, 50)).not.toThrow();
    });

    it("always returns a finite number when inputs are finite", () => {
      expect(Number.isFinite(percentOff(100, 20))).toBe(true);
      expect(Number.isFinite(percentOff(0, 0))).toBe(true);
      expect(Number.isFinite(percentOff(50, -25))).toBe(true);
      expect(Number.isFinite(percentOff(50, 150))).toBe(true);
    });
  });
});
