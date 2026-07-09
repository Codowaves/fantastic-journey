import { describe, expect, it } from "vitest";

import { unique } from "./array-utils";

describe("unique", () => {
  it("removes duplicate values and preserves order", () => {
    const result = unique([1, 2, 2, 3, 1, 4]);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("preserves the first occurrence of duplicates", () => {
    const result = unique(["a", "b", "a", "c", "b"]);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array when given an empty array", () => {
    const result = unique([]);
    expect(result).toEqual([]);
  });

  it("returns the same array when all elements are unique", () => {
    const result = unique([1, 2, 3, 4, 5]);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles an array with all identical values", () => {
    const result = unique([7, 7, 7, 7]);
    expect(result).toEqual([7]);
  });

  it("works with different types (strings)", () => {
    const result = unique(["foo", "bar", "foo", "baz"]);
    expect(result).toEqual(["foo", "bar", "baz"]);
  });

  it("works with boolean values", () => {
    const result = unique([true, false, true, true, false]);
    expect(result).toEqual([true, false]);
  });
});

describe("unique error/edge-case paths", () => {
  describe("non-array inputs", () => {
    it("treats an iterable string as character-by-character, not as a single element", () => {
      // unique uses `new Set(arr)`, which calls `Symbol.iterator`. A string is
      // iterable so it is accepted by Set and used character-by-character
      // rather than as a single element. Lock that behavior in.
      const result = unique("aab" as unknown as number[]);
      expect(result).toEqual(["a", "b"]);
    });

    it("does not throw when given a Set (iterable, treated element-by-element)", () => {
      const set: unknown = new Set([1, 2, 2, 3]);
      expect(() => unique(set as unknown as number[])).not.toThrow();
      const result = unique(set as unknown as number[]);
      // Set iteration order is insertion order.
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns [] for null without throwing (Set(null) is allowed and empty)", () => {
      // `new Set(null)` is explicitly allowed and produces an empty Set,
      // so unique(null) returns [] without throwing. Lock that in.
      expect(() => unique(null as unknown as number[])).not.toThrow();
      expect(unique(null as unknown as number[])).toEqual([]);
    });

    it("returns [] for undefined without throwing (Set(undefined) is allowed and empty)", () => {
      // `new Set(undefined)` is allowed and produces an empty Set.
      expect(() => unique(undefined as unknown as number[])).not.toThrow();
      expect(unique(undefined as unknown as number[])).toEqual([]);
    });

    it("throws TypeError when given a number (not iterable)", () => {
      expect(() => unique(42 as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when given a plain object (not iterable)", () => {
      expect(() => unique({ foo: 1, bar: 2 } as unknown as number[])).toThrow(
        TypeError,
      );
    });
  });

  describe("NaN and Infinity in element positions", () => {
    it("treats NaN and NaN as equal (Set uses SameValueZero), returning a single NaN", () => {
      const result = unique([NaN, NaN, NaN]);
      expect(result).toHaveLength(1);
      expect(Number.isNaN(result[0])).toBe(true);
    });

    it("handles NaN alongside other values without throwing", () => {
      expect(() => unique([1, NaN, 2, NaN, 3])).not.toThrow();
      const result = unique([1, NaN, 2, NaN, 3]);
      // NaN is treated as equal to itself in Set's SameValueZero algorithm,
      // so we expect exactly one NaN entry.
      expect(result.filter((x) => Number.isNaN(x))).toHaveLength(1);
    });

    it("treats +0 and -0 as equal (SameValueZero), returning a single zero", () => {
      const result = unique([+0, -0, 0]);
      expect(result).toEqual([0]);
    });

    it("handles Infinity values without throwing", () => {
      expect(() =>
        unique([Infinity, -Infinity, Infinity, -Infinity]),
      ).not.toThrow();
      const result = unique([Infinity, -Infinity, Infinity, -Infinity]);
      expect(result).toEqual([Infinity, -Infinity]);
    });
  });

  describe("object and array element identity", () => {
    it("keeps structurally identical object references distinct (identity-based dedup)", () => {
      const a = { x: 1 };
      const b = { x: 1 };
      const result = unique([a, b, a]);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(a);
      expect(result[1]).toBe(b);
    });

    it("treats two different array instances with the same contents as distinct", () => {
      const a = [1, 2];
      const b = [1, 2];
      const result = unique([a, b, a]);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(a);
      expect(result[1]).toBe(b);
    });
  });

  describe("edge cases", () => {
    it("does not mutate the input array", () => {
      const input = [1, 2, 2, 3];
      const snapshot = [...input];
      unique(input);
      expect(input).toEqual(snapshot);
    });

    it("returns a new array instance (not the same reference)", () => {
      const input: number[] = [];
      const result = unique(input);
      expect(result).not.toBe(input);
    });

    it("handles a very large array without throwing", () => {
      const big = Array.from({ length: 100_000 }, (_, i) => i % 100);
      expect(() => unique(big)).not.toThrow();
      expect(unique(big)).toHaveLength(100);
    });

    it("handles sparse arrays (holes yield undefined when iterated)", () => {
      // Sparse holes yield `undefined` when iterated, so Set sees
      // `undefined` as a value. Two holes collapse to a single undefined.
      const sparse = [1, , 2, , 1]; // eslint-disable-line no-sparse-arrays
      const result = unique(sparse);
      expect(result).toEqual([1, undefined, 2]);
    });
  });
});
