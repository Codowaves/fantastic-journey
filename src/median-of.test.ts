import { describe, expect, it } from "vitest";

import { medianOf } from "./median-of";

describe("medianOf", () => {
  it("returns 0 for an empty array", () => {
    expect(medianOf([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(medianOf([7])).toBe(7);
  });

  it("returns the single value for a one-element negative array", () => {
    expect(medianOf([-3])).toBe(-3);
  });

  it("returns the middle value of an odd-length array", () => {
    expect(medianOf([1, 2, 3, 4, 5])).toBe(3);
  });

  it("returns the middle value of an odd-length negative array", () => {
    expect(medianOf([-5, -3, -1])).toBe(-3);
  });

  it("returns the average of the two middle values for an even-length array", () => {
    expect(medianOf([1, 2, 3, 4])).toBe(2.5);
  });

  it("returns the average of the two middle values when straddling zero", () => {
    expect(medianOf([-2, -1, 1, 2])).toBe(0);
  });

  it("sorts the input before computing the median", () => {
    expect(medianOf([5, 1, 4, 2, 3])).toBe(3);
  });

  it("sorts a reverse-sorted even array before computing the median", () => {
    expect(medianOf([4, 3, 2, 1])).toBe(2.5);
  });

  it("handles duplicate values", () => {
    expect(medianOf([2, 2, 2, 2])).toBe(2);
  });

  it("does not mutate the input array", () => {
    const input = [5, 1, 4, 2, 3];
    medianOf(input);
    expect(input).toEqual([5, 1, 4, 2, 3]);
  });

  describe("empty-array early-return branch", () => {
    it("returns 0 for an empty array", () => {
      expect(medianOf([])).toBe(0);
    });

    it("returns 0 for an array produced by Array(0)", () => {
      expect(medianOf(Array(0))).toBe(0);
    });

    it("returns 0 for an array produced by new Array()", () => {
      expect(medianOf(new Array<number>())).toBe(0);
    });

    it("does not throw on an empty array", () => {
      expect(() => medianOf([])).not.toThrow();
      expect(() => medianOf(Array(0))).not.toThrow();
    });

    it("does not throw on an array whose length is set but has no own indices", () => {
      // An array with length > 0 but no own indices takes the sort/slice
      // branch, not the empty-array early return. The function should still
      // not throw on such an input.
      const a: number[] = [];
      a.length = 3;
      expect(() => medianOf(a)).not.toThrow();
    });
  });

  describe("odd-length branch (length % 2 === 1)", () => {
    it("returns the middle of a three-element array", () => {
      expect(medianOf([1, 2, 3])).toBe(2);
    });

    it("returns the middle when the array is already sorted", () => {
      expect(medianOf([1, 3, 5, 7, 9])).toBe(5);
    });

    it("returns the middle when the array is reverse-sorted", () => {
      expect(medianOf([9, 7, 5, 3, 1])).toBe(5);
    });

    it("returns the middle even with duplicates", () => {
      expect(medianOf([2, 2, 2, 2, 2])).toBe(2);
    });

    it("handles a length-one array (smallest odd-length input)", () => {
      expect(medianOf([42])).toBe(42);
    });

    it("handles a length-1 array with a negative number", () => {
      expect(medianOf([-99])).toBe(-99);
    });
  });

  describe("even-length fallback branch (averages two middle elements)", () => {
    it("returns the average for a length-two array", () => {
      expect(medianOf([1, 2])).toBe(1.5);
    });

    it("returns the average when both middles are equal", () => {
      expect(medianOf([4, 4, 4, 4])).toBe(4);
    });

    it("returns the average when both middles are negative", () => {
      expect(medianOf([-4, -4, -4, -4])).toBe(-4);
    });

    it("returns the average when middles straddle zero", () => {
      expect(medianOf([-2, -1, 1, 2])).toBe(0);
    });

    it("returns the average of middles after sorting a reverse-sorted array", () => {
      expect(medianOf([4, 3, 2, 1])).toBe(2.5);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal odd-length array", () => {
      expect(() => medianOf([1, 2, 3, 4, 5])).not.toThrow();
    });

    it("does not throw on a normal even-length array", () => {
      expect(() => medianOf([1, 2, 3, 4])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => medianOf([])).not.toThrow();
    });

    it("does not throw on a single-element array", () => {
      expect(() => medianOf([0])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 2, 3, 4, 5]) as number[];
      expect(() => medianOf(frozen)).not.toThrow();
      expect(medianOf(frozen)).toBe(3);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 2, 3, 4]) as number[];
      expect(() => medianOf(sealed)).not.toThrow();
      expect(medianOf(sealed)).toBe(2.5);
    });

    it("does not throw on an array containing NaN", () => {
      expect(() => medianOf([1, Number.NaN, 3])).not.toThrow();
    });

    it("does not throw on an array of all NaNs", () => {
      expect(() =>
        medianOf([Number.NaN, Number.NaN, Number.NaN]),
      ).not.toThrow();
      // NaN propagates: middle element is NaN.
      expect(Number.isNaN(medianOf([Number.NaN, Number.NaN, Number.NaN]))).toBe(
        true,
      );
    });

    it("treats NaN and the early-return branch together (length-1 NaN)", () => {
      // length is odd; the odd-length branch returns the single NaN element.
      expect(Number.isNaN(medianOf([Number.NaN]))).toBe(true);
    });

    it("treats NaN on the even-length fallback branch", () => {
      // Two middles: NaN and another value; (NaN + x)/2 === NaN.
      const r = medianOf([1, Number.NaN, 3, 4]);
      expect(Number.isNaN(r)).toBe(true);
    });

    it("accepts +0 and -0 without throwing on either branch", () => {
      expect(() => medianOf([0, -0])).not.toThrow();
      expect(medianOf([0, -0])).toBe(0);
      expect(() => medianOf([0, -0, 0, -0])).not.toThrow();
      expect(medianOf([0, -0, 0, -0])).toBe(0);
    });

    it("handles a very large sorted array without throwing", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      expect(() => medianOf(arr)).not.toThrow();
      // 1000 is even; middle indices 499 and 500 average to 499.5.
      expect(medianOf(arr)).toBe(499.5);
    });

    it("handles a very large reverse-sorted array without throwing", () => {
      const arr = Array.from({ length: 1001 }, (_, i) => 1000 - i);
      expect(() => medianOf(arr)).not.toThrow();
      // 1001 is odd; middle index 500 holds 500.
      expect(medianOf(arr)).toBe(500);
    });
  });

  describe("input-mutation safety (early return vs sort branch)", () => {
    it("does not mutate the empty array", () => {
      const input: number[] = [];
      medianOf(input);
      expect(input).toEqual([]);
    });

    it("does not mutate a sorted odd-length array", () => {
      const input = [1, 2, 3, 4, 5];
      medianOf(input);
      expect(input).toEqual([1, 2, 3, 4, 5]);
    });

    it("does not mutate an unsorted even-length array", () => {
      const input = [5, 1, 4, 2];
      medianOf(input);
      expect(input).toEqual([5, 1, 4, 2]);
    });

    it("does not mutate a frozen array", () => {
      const frozen = Object.freeze([3, 1, 2]) as number[];
      expect(() => medianOf(frozen)).not.toThrow();
      expect(frozen).toEqual([3, 1, 2]);
    });
  });
});
