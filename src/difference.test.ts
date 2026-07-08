import { describe, expect, it } from "vitest";

import { difference } from "./difference";

describe("difference", () => {
  it("returns values in a that are not in b", () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });

  it("returns an empty array when b contains every element of a", () => {
    expect(difference([1, 2, 3], [1, 2, 3])).toEqual([]);
  });

  it("returns a copy of a when b is empty", () => {
    expect(difference([1, 2, 3], [])).toEqual([1, 2, 3]);
  });

  it("returns an empty array when both inputs are empty", () => {
    expect(difference([], [])).toEqual([]);
  });

  it("preserves the order of the first array", () => {
    expect(difference([3, 1, 4, 1, 5], [1])).toEqual([3, 4, 5]);
  });

  it("works with string values", () => {
    expect(difference(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
  });

  it("ignores duplicates already present in a (returns first occurrence)", () => {
    expect(difference([1, 2, 2, 3, 1], [3])).toEqual([1, 2, 2, 1]);
  });

  it("does not mutate either input array", () => {
    const a = [1, 2, 3];
    const b = [2];
    difference(a, b);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([2]);
  });

  it("throws TypeError when a is null", () => {
    expect(() => difference(null as unknown as number[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => difference(null as unknown as number[], [1, 2])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when a is undefined", () => {
    expect(() => difference(undefined as unknown as number[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => difference(undefined as unknown as number[], [1, 2])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when b is null", () => {
    expect(() => difference([1, 2, 3], null as unknown as number[])).toThrow(
      TypeError,
    );
    expect(() => difference([1, 2, 3], null as unknown as number[])).toThrow(
      "b must be an array",
    );
  });

  it("throws TypeError when b is undefined", () => {
    expect(() =>
      difference([1, 2, 3], undefined as unknown as number[]),
    ).toThrow(TypeError);
    expect(() =>
      difference([1, 2, 3], undefined as unknown as number[]),
    ).toThrow("b must be an array");
  });

  describe("Set-based lookup branch", () => {
    it("treats NaN as present in b and excludes it from a (the Set NaN-equality branch)", () => {
      // Set treats NaN === NaN via SameValueZero, so membership is true.
      expect(difference([1, Number.NaN, 3], [Number.NaN])).toEqual([1, 3]);
    });

    it("treats +0 and -0 as the same value for membership (the Set SameValueZero branch)", () => {
      // +0 and -0 collapse to one Set entry, so either excludes both.
      expect(difference([0, 1], [-0])).toEqual([1]);
      expect(difference([-0, 1], [0])).toEqual([1]);
    });

    it("keeps null values in a when b does not contain null", () => {
      expect(difference([1, null, 2], [2])).toEqual([1, null]);
    });

    it("removes null values in a when b contains null", () => {
      expect(difference([1, null, 2], [null])).toEqual([1, 2]);
    });

    it("keeps undefined values in a when b does not contain undefined", () => {
      expect(difference([1, undefined, 2], [2])).toEqual([1, undefined]);
    });

    it("removes undefined values in a when b contains undefined", () => {
      expect(difference([1, undefined, 2], [undefined])).toEqual([1, 2]);
    });
  });

  describe("duplicate handling in b", () => {
    it("deduplicates b before filtering (the Set construction branch)", () => {
      // Multiple copies in b still exclude a single matching element.
      expect(difference([1, 2, 3], [2, 2, 2])).toEqual([1, 3]);
    });

    it("handles duplicates of b's first element", () => {
      expect(difference([1, 2], [1, 1, 1, 2, 2])).toEqual([]);
    });

    it("handles duplicates of b's last element", () => {
      expect(difference([3, 1], [1, 3, 3, 3])).toEqual([]);
    });
  });

  describe("non-iterable inputs that pass the null/undefined guard", () => {
    it("throws when a is a number (passes the null/undefined guard, then new Set/filter fails)", () => {
      expect(() => difference(7 as unknown as number[], [1, 2])).toThrow();
    });

    it("throws when b is a number (passes the null/undefined guard, then new Set fails)", () => {
      expect(() => difference([1, 2, 3], 7 as unknown as number[])).toThrow();
    });

    it("throws when a is a string (passes the null/undefined guard, filter fails on string)", () => {
      // Strings pass the null/undefined guard, but `filter` is not defined on strings
      // so the call must throw rather than silently succeed.
      expect(() => difference("abc" as unknown as number[], [1, 2])).toThrow();
    });
  });

  describe("readonly and frozen inputs", () => {
    it("does not throw on a frozen b (the Set construction branch with a frozen iterable)", () => {
      const frozen = Object.freeze([2, 4]) as readonly number[];
      expect(difference([1, 2, 3, 4], frozen)).toEqual([1, 3]);
    });

    it("does not throw on a sealed a (the filter branch with a sealed array)", () => {
      const sealed = Object.seal([1, 2, 3]) as readonly number[];
      expect(difference(sealed, [2])).toEqual([1, 3]);
    });

    it("does not mutate a frozen a", () => {
      const frozen = Object.freeze([1, 2, 3]) as readonly number[];
      const result = difference(frozen, [2]);
      expect(result).toEqual([1, 3]);
    });

    it("accepts readonly-typed arrays without throwing", () => {
      const ro: readonly number[] = [1, 2, 3];
      expect(() => difference(ro, [2])).not.toThrow();
      expect(difference(ro, [2])).toEqual([1, 3]);
    });
  });

  describe("sparse and holey arrays", () => {
    it("returns empty when every slot is a hole", () => {
      const sparse: number[] = [];
      sparse.length = 3;
      expect(difference(sparse, [99])).toEqual([]);
    });

    it("passes through defined values while holes are absent from the result", () => {
      const sparse: number[] = [];
      sparse[1] = 2;
      // Length is 2, only index 1 holds a value.
      expect(sparse.length).toBe(2);
      expect(difference(sparse, [99])).toEqual([2]);
    });

    it("excludes the real value when b contains it, leaving no result", () => {
      const sparse: number[] = [];
      sparse[1] = 2;
      expect(difference(sparse, [2])).toEqual([]);
    });
  });

  describe("elements that differ in identity vs value", () => {
    it("compares objects by reference, so distinct objects with equal shape both pass through", () => {
      const a = { id: 1 };
      const b = { id: 1 };
      // Two distinct objects → neither is excluded by reference equality.
      expect(difference([a, b], [a])).toEqual([b]);
    });

    it("excludes every occurrence of a reference that appears once in b", () => {
      const a = { id: 1 };
      const dup = a;
      expect(difference([a, dup, { id: 2 }], [dup])).toEqual([{ id: 2 }]);
    });

    it("does not deep-equal strings or numbers — same value is excluded", () => {
      expect(difference(["x", "y", "z"], ["y"])).toEqual(["x", "z"]);
      expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
    });
  });
});
