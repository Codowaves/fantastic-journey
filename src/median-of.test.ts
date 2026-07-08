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

    it("does not throw on an empty array", () => {
      expect(() => medianOf([])).not.toThrow();
    });

    it("does not throw on Array(0)", () => {
      expect(() => medianOf(Array(0))).not.toThrow();
    });
  });

  describe("single-element array (smallest non-empty case)", () => {
    it("returns the only element when it is a positive number", () => {
      expect(medianOf([42])).toBe(42);
    });

    it("returns the only element when it is zero", () => {
      expect(medianOf([0])).toBe(0);
    });

    it("returns the only element when it is negative", () => {
      expect(medianOf([-42])).toBe(-42);
    });

    it("returns NaN when the only element is NaN", () => {
      // The branch for odd-length arrays returns sorted[mid] directly,
      // including NaN, without any clamping or coercion.
      expect(Number.isNaN(medianOf([Number.NaN]))).toBe(true);
    });
  });

  describe("two-element array (smallest even case)", () => {
    it("returns the average of the two values", () => {
      expect(medianOf([1, 3])).toBe(2);
    });

    it("returns the average of the two values regardless of input order", () => {
      expect(medianOf([3, 1])).toBe(2);
    });

    it("returns 0 when the two values straddle zero", () => {
      expect(medianOf([-1, 1])).toBe(0);
    });

    it("returns the value when both elements are equal", () => {
      expect(medianOf([4, 4])).toBe(4);
    });

    it("returns NaN when one element is NaN", () => {
      // (a + NaN) / 2 is NaN for any a.
      expect(Number.isNaN(medianOf([1, Number.NaN]))).toBe(true);
      expect(Number.isNaN(medianOf([Number.NaN, 1]))).toBe(true);
    });
  });

  describe("edge inputs that should not throw", () => {
    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 2, 3, 4, 5]) as number[];
      expect(() => medianOf(frozen)).not.toThrow();
      expect(medianOf(frozen)).toBe(3);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([4, 3, 2, 1]) as number[];
      expect(() => medianOf(sealed)).not.toThrow();
      expect(medianOf(sealed)).toBe(2.5);
    });

    it("does not throw on an array of length 1", () => {
      expect(() => medianOf([7])).not.toThrow();
    });

    it("does not throw on an array of length 2", () => {
      expect(() => medianOf([1, 2])).not.toThrow();
    });
  });

  describe("large and boundary-sized arrays", () => {
    it("returns the middle element for a large odd-length array", () => {
      const arr = Array.from({ length: 101 }, (_, i) => i);
      expect(medianOf(arr)).toBe(50);
    });

    it("returns the average for a large even-length array", () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      // Middle two are 49 and 50.
      expect(medianOf(arr)).toBe(49.5);
    });

    it("handles an array of identical values regardless of length", () => {
      expect(medianOf(Array.from({ length: 1000 }, () => 7))).toBe(7);
    });
  });

  describe("numeric edge values", () => {
    it("handles Infinity in an odd-length array", () => {
      // [Infinity, 1, 2] sorted: [1, 2, Infinity] -> middle is 2.
      expect(medianOf([Infinity, 1, 2])).toBe(2);
    });

    it("handles Infinity in an even-length array", () => {
      // [1, 2, Infinity, Infinity] sorted: [1, 2, Infinity, Infinity]
      // Middle two are 2 and Infinity -> (2 + Infinity) / 2 = Infinity.
      expect(medianOf([1, 2, Infinity, Infinity])).toBe(Infinity);
    });

    it("handles -Infinity in an odd-length array", () => {
      // [-Infinity, 1, 2] sorted: [-Infinity, 1, 2] -> middle is 1.
      expect(medianOf([-Infinity, 1, 2])).toBe(1);
    });

    it("returns the only finite value when mixed with Infinity", () => {
      expect(
        medianOf([Number.POSITIVE_INFINITY, 5, Number.NEGATIVE_INFINITY]),
      ).toBe(5);
    });

    it("handles Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER", () => {
      const max = Number.MAX_SAFE_INTEGER;
      const min = Number.MIN_SAFE_INTEGER;
      // [min, max] -> (min + max) / 2 = 0.
      expect(medianOf([min, max])).toBe(0);
    });
  });
});
