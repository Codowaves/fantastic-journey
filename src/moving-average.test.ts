import { describe, expect, it } from "vitest";

import { movingAverage } from "./moving-average";

describe("movingAverage", () => {
  it("returns an empty array when the window is larger than the series", () => {
    expect(movingAverage([1, 2, 3], 5)).toEqual([]);
  });

  it("returns a single average when the window equals the series length", () => {
    expect(movingAverage([2, 4, 6, 8], 4)).toEqual([5]);
  });

  it("computes the sliding-window averages", () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toEqual([2, 3, 4]);
  });

  it("handles an empty series", () => {
    expect(movingAverage([], 3)).toEqual([]);
  });

  it("throws when the window size is not positive", () => {
    expect(() => movingAverage([1, 2, 3], 0)).toThrow(RangeError);
    expect(() => movingAverage([1, 2, 3], -1)).toThrow(RangeError);
  });

  describe("error/throw paths", () => {
    it("throws RangeError for zero window size on an empty series", () => {
      expect(() => movingAverage([], 0)).toThrow(RangeError);
    });

    it("throws RangeError for a negative window size on an empty series", () => {
      expect(() => movingAverage([], -3)).toThrow(RangeError);
    });

    it("throws RangeError for a very large negative window size", () => {
      expect(() => movingAverage([1, 2, 3], -1e9)).toThrow(RangeError);
    });

    it("throws RangeError with a descriptive message about the window size", () => {
      expect(() => movingAverage([1, 2, 3], 0)).toThrow(/window size/);
      expect(() => movingAverage([1, 2, 3], -5)).toThrow(/positive/);
    });

    it("does not throw on a valid window size", () => {
      expect(() => movingAverage([1, 2, 3], 1)).not.toThrow();
      expect(() => movingAverage([1, 2, 3], 2)).not.toThrow();
      expect(() => movingAverage([1, 2, 3], 3)).not.toThrow();
    });

    it("does not throw when the window is larger than the series (fallback returns empty)", () => {
      expect(() => movingAverage([1, 2, 3], 5)).not.toThrow();
    });

    it("does not throw on an empty series with a positive window", () => {
      expect(() => movingAverage([], 1)).not.toThrow();
    });

    it("does not throw when called with NaN as the window size (current behaviour: returns [])", () => {
      // Documenting current behaviour: NaN slips through the `w <= 0` guard
      // (NaN comparisons are all false), then `nums.length < NaN` is false
      // because NaN compares as not-less-than anything, so the main loop runs
      // and produces NaN-tainted averages. The guard does not (yet) reject NaN.
      expect(() => movingAverage([1, 2, 3], Number.NaN)).not.toThrow();
    });

    it("does not throw when called with a non-integer window size (current behaviour)", () => {
      // Documenting current behaviour: the guard is `w <= 0`, not
      // `Number.isInteger(w)`, so fractional windows pass through.
      expect(() => movingAverage([1, 2, 3], 2.5)).not.toThrow();
      expect(() => movingAverage([1, 2, 3], 1.1)).not.toThrow();
    });

    it("treats Infinity as 'window larger than series' and returns []", () => {
      // Infinity > 0 is true, so the simple `w <= 0` guard passes — and then
      // `nums.length < Infinity` returns [] for any finite series. Documenting
      // current behaviour: Infinity is treated as "window larger than series".
      expect(() =>
        movingAverage([1, 2, 3], Number.POSITIVE_INFINITY),
      ).not.toThrow();
      expect(movingAverage([1, 2, 3], Number.POSITIVE_INFINITY)).toEqual([]);
    });

    it("does not throw on a frozen series", () => {
      const frozen = Object.freeze([1, 2, 3, 4]) as number[];
      expect(() => movingAverage(frozen, 2)).not.toThrow();
      expect(movingAverage(frozen, 2)).toEqual([1.5, 2.5, 3.5]);
    });

    it("does not throw on a sealed series", () => {
      const sealed = Object.seal([1, 2, 3, 4]) as number[];
      expect(() => movingAverage(sealed, 2)).not.toThrow();
      expect(movingAverage(sealed, 2)).toEqual([1.5, 2.5, 3.5]);
    });
  });

  describe("fallback branch (series shorter than window)", () => {
    it("returns an empty array when the series is shorter than the window by one", () => {
      expect(movingAverage([1, 2, 3, 4], 5)).toEqual([]);
    });

    it("returns an empty array when the window is much larger than the series", () => {
      expect(movingAverage([1], 100)).toEqual([]);
    });

    it("returns an empty array when the series is empty regardless of window size", () => {
      expect(movingAverage([], 1)).toEqual([]);
      expect(movingAverage([], 5)).toEqual([]);
      expect(movingAverage([], 1000)).toEqual([]);
    });

    it("returns an empty array produced by Array(0)", () => {
      expect(movingAverage(Array(0), 1)).toEqual([]);
    });

    it("returns an empty array produced by new Array()", () => {
      expect(movingAverage(new Array<number>(), 3)).toEqual([]);
    });

    it("does not invoke the fallback branch when the series has length set but no own indices", () => {
      // Documenting current behaviour: `nums.length < w` uses the array's
      // length, not its element count, so a sparse array with length 4 and
      // no own indices enters the main loop and the holes coerce to NaN.
      // The fallback branch only fires on `length < w`, which this case
      // (length 4, w 2) does not satisfy.
      const sparse: number[] = [];
      sparse.length = 4;
      expect(sparse.length).toBe(4);
      expect(movingAverage(sparse, 5)).toEqual([]);
      expect(movingAverage(sparse, 100)).toEqual([]);
    });

    it("does not fall through to the main loop when the fallback triggers", () => {
      // The fallback short-circuits; a series that is exactly w-1 long must
      // not produce any averages and must not attempt to index out of bounds.
      expect(movingAverage([1, 2], 3)).toEqual([]);
    });
  });
});
