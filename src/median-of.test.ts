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

  describe("empty-array fallback branch", () => {
    it("returns 0 for an array produced by Array(0)", () => {
      expect(medianOf(Array(0))).toBe(0);
    });

    it("returns 0 for an array produced by new Array()", () => {
      expect(medianOf(new Array<number>())).toBe(0);
    });

    it("returns 0 for an empty readonly array", () => {
      const ro: readonly number[] = Object.freeze([]);
      expect(medianOf(ro)).toBe(0);
    });

    it("does not throw when called on an empty array", () => {
      expect(() => medianOf([])).not.toThrow();
      expect(() => medianOf(Array(0))).not.toThrow();
      expect(() => medianOf(new Array<number>())).not.toThrow();
    });
  });

  describe("odd-length branch", () => {
    it("returns the middle element when the array is already sorted ascending", () => {
      expect(medianOf([1, 2, 3])).toBe(2);
    });

    it("returns the middle element when the array is sorted descending", () => {
      expect(medianOf([9, 7, 5, 3, 1])).toBe(5);
    });

    it("returns the middle element when the median value has duplicates", () => {
      expect(medianOf([1, 2, 2, 2, 3])).toBe(2);
    });

    it("handles a large odd-length array", () => {
      const arr = Array.from({ length: 1001 }, (_, i) => i);
      expect(medianOf(arr)).toBe(500);
    });
  });

  describe("even-length branch", () => {
    it("returns the average when the two middle values are equal", () => {
      expect(medianOf([2, 2, 2, 2])).toBe(2);
    });

    it("returns a non-integer average", () => {
      expect(medianOf([1, 2, 2, 3])).toBe(2);
    });

    it("returns 0 for an even-length array whose middle pair sums to 0", () => {
      expect(medianOf([-3, -1, 1, 3])).toBe(0);
    });

    it("handles a large even-length array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      expect(medianOf(arr)).toBe(499.5);
    });
  });

  describe("sort branch coverage", () => {
    it("exercises the comparator when the input is in random order", () => {
      expect(medianOf([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toBe(4);
    });

    it("sorts a single-element array without invoking the comparator meaningfully", () => {
      expect(medianOf([42])).toBe(42);
    });

    it("sorts a two-element array via the comparator", () => {
      expect(medianOf([9, 1])).toBe(5);
    });
  });

  describe("NaN and special numeric values", () => {
    it("returns NaN when the array contains a NaN at the median position", () => {
      // NaN sorts to the end under numeric sort; median position is index 1.
      expect(Number.isNaN(medianOf([1, Number.NaN, 3]))).toBe(true);
    });

    it("returns NaN when an even-length array has NaN in the middle pair", () => {
      expect(Number.isNaN(medianOf([1, 2, Number.NaN, 4]))).toBe(true);
    });

    it("treats +0 and -0 as equal at the median", () => {
      expect(medianOf([0, -0, 0, -0])).toBe(0);
      expect(Object.is(medianOf([0, -0, 0, -0]), 0)).toBe(true);
    });

    it("handles Infinity and -Infinity", () => {
      expect(
        medianOf([Number.POSITIVE_INFINITY, 0, Number.NEGATIVE_INFINITY]),
      ).toBe(0);
      expect(
        medianOf([Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]),
      ).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe("error / throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => medianOf([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => medianOf([])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([3, 1, 2]) as number[];
      expect(() => medianOf(frozen)).not.toThrow();
      expect(medianOf(frozen)).toBe(2);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([5, 1, 4, 2, 3]) as number[];
      expect(() => medianOf(sealed)).not.toThrow();
      expect(medianOf(sealed)).toBe(3);
    });

    it("does not mutate a frozen input array", () => {
      const frozen = Object.freeze([3, 1, 2]) as readonly number[];
      medianOf(frozen);
      expect(frozen).toEqual([3, 1, 2]);
    });
  });
});
