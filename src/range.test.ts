import { describe, expect, it } from "vitest";

import { range } from "./range";

describe("range", () => {
  it("returns the integers from start (inclusive) to end (exclusive)", () => {
    expect(range(0, 3)).toEqual([0, 1, 2]);
  });

  it("returns an empty array when end equals start", () => {
    expect(range(2, 2)).toEqual([]);
  });

  it("returns an empty array when end is less than start", () => {
    expect(range(5, 1)).toEqual([]);
  });

  it("returns a single-element array when end is start + 1", () => {
    expect(range(4, 5)).toEqual([4]);
  });

  it("throws a RangeError when start is not an integer", () => {
    expect(() => range(0.5, 3)).toThrow(RangeError);
  });

  it("throws a RangeError when end is not an integer", () => {
    expect(() => range(0, 3.5)).toThrow(RangeError);
  });

  describe("error/throw paths on non-integer arguments", () => {
    it("throws a RangeError when start is NaN", () => {
      expect(() => range(Number.NaN, 3)).toThrow(RangeError);
    });

    it("throws a RangeError when end is NaN", () => {
      expect(() => range(0, Number.NaN)).toThrow(RangeError);
    });

    it("throws a RangeError when both arguments are NaN", () => {
      expect(() => range(Number.NaN, Number.NaN)).toThrow(RangeError);
    });

    it("throws a RangeError when start is positive Infinity", () => {
      expect(() => range(Number.POSITIVE_INFINITY, 3)).toThrow(RangeError);
    });

    it("throws a RangeError when start is negative Infinity", () => {
      expect(() => range(Number.NEGATIVE_INFINITY, 3)).toThrow(RangeError);
    });

    it("throws a RangeError when end is positive Infinity", () => {
      expect(() => range(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    });

    it("throws a RangeError when end is negative Infinity", () => {
      expect(() => range(0, Number.NEGATIVE_INFINITY)).toThrow(RangeError);
    });

    it("includes a descriptive message in the RangeError", () => {
      expect(() => range(0.5, 3)).toThrow("range() requires integer arguments");
      expect(() => range(Number.NaN, 3)).toThrow(
        "range() requires integer arguments",
      );
    });

    it("does not throw on valid integer arguments including zero and negatives", () => {
      expect(() => range(0, 0)).not.toThrow();
      expect(() => range(0, 5)).not.toThrow();
      expect(() => range(-3, 3)).not.toThrow();
      expect(() => range(-5, -2)).not.toThrow();
    });
  });

  describe("empty-range branch (end <= start)", () => {
    it("returns an empty array when end equals start at zero", () => {
      expect(range(0, 0)).toEqual([]);
    });

    it("returns an empty array for a negative range with end equal to start", () => {
      expect(range(-3, -3)).toEqual([]);
    });

    it("returns an empty array when end is one less than start", () => {
      expect(range(3, 2)).toEqual([]);
    });

    it("returns an empty array when end is much less than start", () => {
      expect(range(10, 0)).toEqual([]);
    });

    it("returns an empty array for a fully negative range where end < start", () => {
      expect(range(-1, -5)).toEqual([]);
    });
  });

  describe("valid range outputs across the integer domain", () => {
    it("handles negative-to-positive ranges", () => {
      expect(range(-2, 2)).toEqual([-2, -1, 0, 1]);
    });

    it("handles fully negative ranges", () => {
      expect(range(-5, -2)).toEqual([-5, -4, -3]);
    });

    it("handles a zero-starting range", () => {
      expect(range(0, 4)).toEqual([0, 1, 2, 3]);
    });

    it("preserves the exclusive end bound (never includes end itself)", () => {
      const result = range(2, 7);
      expect(result[result.length - 1]).toBe(6);
      expect(result).not.toContain(7);
    });

    it("returns an array of the expected length (end - start)", () => {
      expect(range(0, 10)).toHaveLength(10);
      expect(range(-3, 4)).toHaveLength(7);
      expect(range(5, 5)).toHaveLength(0);
    });
  });
});
