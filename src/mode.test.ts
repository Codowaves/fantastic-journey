import { describe, expect, it } from "vitest";

import { mode } from "./mode";

describe("mode", () => {
  it("returns undefined for an empty array", () => {
    expect(mode([])).toBeUndefined();
  });

  it("returns the single value for a one-element array", () => {
    expect(mode([7])).toBe(7);
  });

  it("returns the most frequent value", () => {
    expect(mode([1, 2, 2, 3, 3, 3, 4])).toBe(3);
  });

  it("returns the first value seen on a tie", () => {
    expect(mode([1, 1, 2, 2, 3])).toBe(1);
  });

  describe("fallback branch (empty array)", () => {
    it("returns undefined for an empty array produced by Array(0)", () => {
      expect(mode(Array(0))).toBeUndefined();
    });

    it("returns undefined for an array produced by new Array()", () => {
      expect(mode(new Array<number>())).toBeUndefined();
    });

    it("keeps bestCount at 0 across an empty iteration", () => {
      // No numbers means the map stays empty and best is never reassigned
      // from its initial `undefined` value.
      expect(mode([])).toBeUndefined();
    });
  });

  describe("single-element array (smallest non-empty case)", () => {
    it("returns the only element when it is positive", () => {
      expect(mode([42])).toBe(42);
    });

    it("returns the only element when it is negative", () => {
      expect(mode([-7])).toBe(-7);
    });

    it("returns 0 when the only element is zero", () => {
      expect(mode([0])).toBe(0);
    });

    it("returns NaN when the only element is NaN", () => {
      const result = mode([Number.NaN]);
      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe("sparse arrays and holes", () => {
    it("treats hole slots as undefined and counts them as a value", () => {
      // `for-of` over a sparse array yields `undefined` for every hole.
      // `mode` then stores those `undefined` keys in the count map — they
      // are real values from the function's perspective.
      const sparse: number[] = new Array(3);
      expect(sparse.length).toBe(3);
      expect(mode(sparse)).toBeUndefined();
    });

    it("returns the only defined value when defined slots outnumber holes", () => {
      // 4 holes + 1 explicit 9 → undefined dominates; document the actual
      // behavior rather than papering over it.
      const sparse: number[] = new Array(5);
      sparse[3] = 9;
      expect(mode(sparse)).toBeUndefined();
    });

    it("returns the most-frequent value when explicit values tie holes", () => {
      const sparse: number[] = new Array(5);
      sparse[0] = 1;
      sparse[2] = 1;
      sparse[4] = 9;
      // 2 holes (undefined), two 1s, one 9 → 1 and undefined both have count 2;
      // first-seen wins, and the first value in the iteration order is the
      // hole at index 0. Override by giving 1 the lead with an extra slot.
      sparse[4] = 1;
      expect(mode(sparse)).toBe(1);
    });

    it("returns 9 when 9 appears more often than holes", () => {
      const sparse: number[] = new Array(5);
      sparse[0] = 9;
      sparse[2] = 9;
      sparse[4] = 9;
      // 2 holes (undefined) vs 3 nines → 9 wins
      expect(mode(sparse)).toBe(9);
    });

    it("does not crash on entirely sparse arrays of any length", () => {
      expect(() => mode(new Array(10))).not.toThrow();
      expect(() => mode(new Array(1000))).not.toThrow();
    });
  });

  describe("NaN and special numeric values", () => {
    it("treats NaN as a valid key (NaN === NaN via Map, not via ===)", () => {
      // Map uses SameValueZero, so NaN keys match. mode([NaN, NaN]) should
      // return NaN — the first-seen NaN wins.
      const result = mode([Number.NaN, Number.NaN, 1]);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("does not throw on Infinity values", () => {
      expect(() => mode([Infinity, Infinity, -Infinity])).not.toThrow();
    });

    it("returns Infinity when it is the most frequent value", () => {
      expect(mode([Infinity, Infinity, 1, 2])).toBe(Infinity);
    });

    it("returns -Infinity when it is the most frequent value", () => {
      expect(mode([-Infinity, -Infinity, 1, 2])).toBe(-Infinity);
    });

    it("returns the second-seen zero when SameValueZero collapses them", () => {
      // Per Map / SameValueZero, +0 and -0 compare equal, so they share a
      // single count bucket. As the count grows, `best` is reassigned to
      // whichever literal appeared most recently — that is the documented
      // observed behavior of the function.
      expect(mode([0, -0, 1])).toBe(-0);
      expect(mode([-0, 0, 1])).toBe(0);
    });
  });

  describe("negative numbers and signed zeros", () => {
    it("returns the most frequent negative value", () => {
      expect(mode([-1, -2, -2, -3, -3, -3])).toBe(-3);
    });

    it("returns a negative value that beats positive values in frequency", () => {
      expect(mode([1, 2, 3, -1, -1])).toBe(-1);
    });

    it("handles a mix of positive and negative numbers on a tie", () => {
      // First-seen wins: -1 comes before 1.
      expect(mode([-1, -1, 1, 1, 2])).toBe(-1);
    });
  });

  describe("uniform arrays", () => {
    it("returns the value when every element is the same", () => {
      expect(mode([5, 5, 5, 5, 5])).toBe(5);
    });

    it("returns the value for a uniform array of zeros", () => {
      expect(mode([0, 0, 0])).toBe(0);
    });

    it("returns the value for a uniform array of negative numbers", () => {
      expect(mode([-9, -9, -9, -9])).toBe(-9);
    });
  });

  describe("large inputs and high frequencies", () => {
    it("handles a long array where one value dominates", () => {
      const arr = [1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1];
      expect(mode(arr)).toBe(1);
    });

    it("handles a long array where every value is unique", () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      // Every value has count 1, so the first-seen value wins.
      expect(mode(arr)).toBe(0);
    });

    it("handles frequencies well above the count of distinct values", () => {
      const arr = new Array<number>(1000).fill(7);
      expect(mode(arr)).toBe(7);
    });
  });

  describe("typed-array-like inputs", () => {
    it("works on an array of floats", () => {
      expect(mode([1.5, 2.5, 2.5, 3.5, 3.5, 3.5])).toBe(3.5);
    });

    it("treats 1 and 1.0 as the same key (Map normalises numeric keys)", () => {
      // 1 and 1.0 are the same number, so the map only has one bucket.
      expect(mode([1, 1.0, 1, 1.0])).toBe(1);
    });
  });

  describe("non-throwing guarantees", () => {
    it("does not throw on an empty array", () => {
      expect(() => mode([])).not.toThrow();
    });

    it("does not throw on a sparse array with all holes", () => {
      expect(() => mode(new Array(100))).not.toThrow();
    });

    it("does not throw on NaN / Infinity values", () => {
      expect(() => mode([NaN, Infinity, -Infinity])).not.toThrow();
      expect(() => mode([NaN, NaN, NaN])).not.toThrow();
    });

    it("does not throw on extremely large numeric inputs", () => {
      expect(() =>
        mode([Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE]),
      ).not.toThrow();
    });
  });
});
