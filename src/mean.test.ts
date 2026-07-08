import { describe, expect, it } from "vitest";

import { mean } from "./mean";

describe("mean", () => {
  it("returns 0 for an empty array", () => {
    expect(mean([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(mean([7])).toBe(7);
  });

  it("returns the arithmetic mean of multiple values", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });

  it("returns 0 when all values are 0", () => {
    expect(mean([0, 0, 0])).toBe(0);
  });

  describe("fallback branch (empty array)", () => {
    it("returns 0 for an empty array produced by Array(0)", () => {
      expect(mean(Array(0))).toBe(0);
    });

    it("returns 0 for an array produced by new Array()", () => {
      expect(mean(new Array<number>())).toBe(0);
    });

    it("returns NaN for an array with length set but no own indices", () => {
      // for...of yields nothing when there are no defined indices, so the
      // sum stays 0 and 0 / length yields NaN — distinct from the empty-array
      // fallback which short-circuits before the division.
      const a: number[] = [];
      a.length = 5;
      expect(Number.isNaN(mean(a))).toBe(true);
    });

    it("does not throw when the array is empty", () => {
      expect(() => mean([])).not.toThrow();
      expect(() => mean(Array(0))).not.toThrow();
    });
  });

  describe("numeric edge cases", () => {
    it("handles negative numbers", () => {
      expect(mean([-1, -2, -3])).toBe(-2);
    });

    it("handles a mix of positive and negative numbers", () => {
      expect(mean([-4, 4])).toBe(0);
      expect(mean([-2, 2])).toBe(0);
    });

    it("preserves fractional results without rounding", () => {
      expect(mean([1, 2])).toBe(1.5);
      expect(mean([1, 2, 4, 8])).toBe(3.75);
    });

    it("treats NaN as a valid input and propagates NaN", () => {
      expect(Number.isNaN(mean([1, Number.NaN, 3]))).toBe(true);
    });

    it("treats Infinity as a valid input", () => {
      expect(mean([1, 2, Number.POSITIVE_INFINITY])).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("handles very large numbers without overflow in the sum", () => {
      expect(mean([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])).toBe(
        Number.MAX_SAFE_INTEGER,
      );
    });

    it("does not mutate the input array", () => {
      const input = [1, 2, 3, 4];
      const copy = [...input];
      mean(input);
      expect(input).toEqual(copy);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => mean([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => mean([])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      expect(() => mean(frozen)).not.toThrow();
      expect(mean(frozen)).toBe(2);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 2, 3]) as number[];
      expect(() => mean(sealed)).not.toThrow();
      expect(mean(sealed)).toBe(2);
    });
  });
});
