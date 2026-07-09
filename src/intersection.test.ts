import { describe, expect, it } from "vitest";

import { intersection } from "./intersection";

describe("intersection", () => {
  it("returns values present in both arrays", () => {
    const result = intersection([1, 2, 3, 4], [2, 3, 4, 5]);
    expect(result).toEqual([2, 3, 4]);
  });

  it("preserves order from the first array", () => {
    const result = intersection([4, 3, 2, 1], [1, 2, 3, 4]);
    expect(result).toEqual([4, 3, 2, 1]);
  });

  it("returns an empty array when there is no overlap", () => {
    const result = intersection([1, 2, 3], [4, 5, 6]);
    expect(result).toEqual([]);
  });

  it("returns an empty array when either array is empty", () => {
    expect(intersection([], [1, 2, 3])).toEqual([]);
    expect(intersection([1, 2, 3], [])).toEqual([]);
  });

  it("deduplicates values within the result", () => {
    const result = intersection([1, 2, 2, 3, 3, 3], [2, 3]);
    expect(result).toEqual([2, 3]);
  });

  it("works with strings", () => {
    const result = intersection(["a", "b", "c", "d"], ["c", "d", "e"]);
    expect(result).toEqual(["c", "d"]);
  });

  describe("error/throw paths", () => {
    it("does not throw on normal arrays", () => {
      expect(() => intersection([1, 2, 3], [2, 3, 4])).not.toThrow();
    });

    it("does not throw on empty arrays", () => {
      expect(() => intersection([], [])).not.toThrow();
      expect(() => intersection([], [1, 2])).not.toThrow();
      expect(() => intersection([1, 2], [])).not.toThrow();
    });

    it("does not throw on a frozen first array", () => {
      const a = Object.freeze([1, 2, 3]) as number[];
      expect(() => intersection(a, [2, 3])).not.toThrow();
      expect(intersection(a, [2, 3])).toEqual([2, 3]);
    });

    it("does not throw on a sealed first array", () => {
      const a = Object.seal([1, 2, 3]) as number[];
      expect(() => intersection(a, [2, 3])).not.toThrow();
      expect(intersection(a, [2, 3])).toEqual([2, 3]);
    });

    it("does not throw on a frozen second array", () => {
      const b = Object.freeze([2, 3]) as number[];
      expect(() => intersection([1, 2, 3], b)).not.toThrow();
      expect(intersection([1, 2, 3], b)).toEqual([2, 3]);
    });

    it("throws a TypeError when the first argument is null", () => {
      // for-of on null dereferences null[Symbol.iterator], which throws.
      expect(() => intersection(null as unknown as number[], [1, 2])).toThrow(
        TypeError,
      );
    });

    it("throws a TypeError when the first argument is undefined", () => {
      expect(() =>
        intersection(undefined as unknown as number[], [1, 2]),
      ).toThrow(TypeError);
    });

    it("throws a TypeError when the first argument is a non-iterable primitive (number)", () => {
      // Numbers are not iterable, so for-of throws TypeError.
      expect(() => intersection(42 as unknown as number[], [1, 2])).toThrow(
        TypeError,
      );
    });

    it("does not throw on null/undefined second argument (Set silently treats them as empty)", () => {
      // `new Set(null)` and `new Set(undefined)` produce empty Sets without
      // throwing, so the function returns [] cleanly.
      expect(() =>
        intersection([1, 2, 3], null as unknown as number[]),
      ).not.toThrow();
      expect(() =>
        intersection([1, 2, 3], undefined as unknown as number[]),
      ).not.toThrow();
      expect(intersection([1, 2, 3], null as unknown as number[])).toEqual([]);
      expect(intersection([1, 2, 3], undefined as unknown as number[])).toEqual(
        [],
      );
    });
  });

  describe("typed and heterogeneous inputs", () => {
    it("treats NaN as a valid equal value across both arrays", () => {
      // NaN compares as not-equal to itself, but Set membership uses SameValueZero,
      // so NaN matches NaN.
      expect(intersection([Number.NaN, 1], [Number.NaN, 2])).toEqual([
        Number.NaN,
      ]);
    });

    it("preserves object identity (does not deep-compare)", () => {
      const obj = { id: 1 };
      const result = intersection([obj, { id: 2 }], [obj, { id: 3 }]);
      expect(result).toEqual([obj]);
      expect(result[0]).toBe(obj);
    });

    it("treats null and undefined as distinct values", () => {
      expect(intersection([null, undefined, 1], [null, undefined])).toEqual([
        null,
        undefined,
      ]);
    });

    it("deduplicates identical object references", () => {
      const obj = { id: 1 };
      const result = intersection([obj, obj, obj], [obj]);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(obj);
    });
  });

  describe("self-intersection", () => {
    it("returns a deduplicated copy of the array", () => {
      const result = intersection([1, 2, 2, 3, 3, 3], [1, 2, 2, 3, 3, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("does not mutate the input array", () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      intersection(a, b);
      expect(a).toEqual([1, 2, 3]);
      expect(b).toEqual([1, 2, 3]);
    });
  });

  describe("sparse arrays and holes", () => {
    it("treats holes in the first array as undefined", () => {
      const sparse: number[] = [];
      sparse[1] = 1;
      // Holes exist at index 0; intersection with undefined-containing set
      // should yield [] because undefined is not in [1].
      expect(intersection(sparse, [1])).toEqual([1]);
    });

    it("does not throw on a sparse first array", () => {
      const sparse: number[] = [];
      sparse[2] = 2;
      expect(() => intersection(sparse, [2])).not.toThrow();
      expect(intersection(sparse, [2])).toEqual([2]);
    });
  });
});
