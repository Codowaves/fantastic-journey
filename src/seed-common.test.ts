import { describe, expect, it } from "vitest";

import { commonItems } from "./seed-common";

describe("commonItems", () => {
  it("returns the intersection preserving order of a", () => {
    expect(commonItems([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  describe("false branch: element not in b", () => {
    it("skips elements that are not present in b", () => {
      expect(commonItems([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it("skips non-matching elements while keeping matching ones", () => {
      expect(commonItems([1, 4, 2, 5, 3], [2, 3, 6])).toEqual([2, 3]);
    });

    it("returns empty array when a is empty", () => {
      expect(commonItems([], [1, 2, 3])).toEqual([]);
    });

    it("returns empty array when b is empty", () => {
      expect(commonItems([1, 2, 3], [])).toEqual([]);
    });

    it("returns empty array when both arrays are empty", () => {
      expect(commonItems([], [])).toEqual([]);
    });
  });

  describe("dedup branch: seen.has(x) blocks re-push", () => {
    it("drops duplicates from a, keeping first occurrence only", () => {
      expect(commonItems([1, 2, 1, 3, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("drops consecutive duplicates of an element present in b", () => {
      expect(commonItems([1, 1, 1], [1])).toEqual([1]);
    });

    it("treats b duplicates as a single membership", () => {
      expect(commonItems([1, 2, 3], [2, 2, 2, 3, 3])).toEqual([2, 3]);
    });

    it("drops duplicates that appear after other elements", () => {
      expect(commonItems([2, 1, 2, 1, 2], [1, 2])).toEqual([2, 1]);
    });
  });

  describe("input shape variants", () => {
    it("accepts Array.from iterable for b", () => {
      const setB = new Set([2, 3, 4]);
      expect(commonItems([1, 2, 3], Array.from(setB))).toEqual([2, 3]);
    });

    it("accepts Array-like constructed via new Array()", () => {
      const a = new Array<number>();
      a.push(1, 2, 3);
      expect(commonItems(a, [2, 3])).toEqual([2, 3]);
    });

    it("handles a frozen array without throwing", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      expect(() => commonItems(frozen, [2])).not.toThrow();
      expect(commonItems(frozen, [2])).toEqual([2]);
    });

    it("handles a sealed array without throwing", () => {
      const sealed = Object.seal([1, 2, 3]) as number[];
      expect(() => commonItems(sealed, [2])).not.toThrow();
      expect(commonItems(sealed, [2])).toEqual([2]);
    });
  });

  describe("Set-based equality semantics", () => {
    it("treats NaN as equal to NaN (Set has treats NaN as same-value)", () => {
      expect(commonItems([Number.NaN, 1], [Number.NaN, 2])).toEqual([
        Number.NaN,
      ]);
    });

    it("treats +0 and -0 as the same key in the membership set", () => {
      expect(commonItems([-0, 1], [+0, 2])).toEqual([-0]);
    });

    it("compares object identity (no structural equality)", () => {
      const o = { id: 1 };
      const p = { id: 1 };
      expect(commonItems([o], [p])).toEqual([]);
      expect(commonItems([o], [o])).toEqual([o]);
    });

    it("treats null and undefined as distinct keys", () => {
      expect(commonItems([null, undefined], [undefined])).toEqual([undefined]);
      expect(commonItems([null, 1], [null, 2])).toEqual([null]);
    });

    it("handles string values case-sensitively", () => {
      expect(commonItems(["a", "A"], ["A"])).toEqual(["A"]);
      expect(commonItems(["a", "A"], ["a"])).toEqual(["a"]);
    });
  });

  describe("order preservation", () => {
    it("preserves the order of a even when b is reversed", () => {
      expect(commonItems([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it("preserves a's order regardless of b's order", () => {
      expect(commonItems(["x", "y", "z"], ["z", "y", "x"])).toEqual([
        "x",
        "y",
        "z",
      ]);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on normal arrays", () => {
      expect(() => commonItems([1, 2, 3], [2, 3])).not.toThrow();
    });

    it("does not throw when either array is empty", () => {
      expect(() => commonItems([], [1])).not.toThrow();
      expect(() => commonItems([1], [])).not.toThrow();
      expect(() => commonItems([], [])).not.toThrow();
    });

    it("does not throw on an array of undefined values", () => {
      expect(() =>
        commonItems([undefined, undefined], [undefined]),
      ).not.toThrow();
    });

    it("does not throw on a frozen input array", () => {
      const a = Object.freeze([1, 2, 3]);
      const b = Object.freeze([2, 3]);
      expect(() => commonItems(a as number[], b as number[])).not.toThrow();
    });
  });
});
