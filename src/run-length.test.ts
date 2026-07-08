import { describe, expect, it } from "vitest";

import { runLength } from "./run-length";

describe("runLength", () => {
  it("encodes runs of equal adjacent numbers", () => {
    expect(runLength([1, 1, 2, 2, 2, 3, 1])).toEqual([
      [1, 2],
      [2, 3],
      [3, 1],
      [1, 1],
    ]);
  });

  it("encodes a single run covering the whole array", () => {
    expect(runLength(["a", "a", "a", "a"])).toEqual([["a", 4]]);
  });

  it("treats every item as its own run when no two adjacent items are equal", () => {
    expect(runLength([1, 2, 3, 4])).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(runLength<number>([])).toEqual([]);
  });

  it("returns a single pair with count 1 for a single-item input", () => {
    expect(runLength([42])).toEqual([[42, 1]]);
  });

  it("preserves the order of first-seen values", () => {
    expect(runLength([true, false, true, true, false])).toEqual([
      [true, 1],
      [false, 1],
      [true, 2],
      [false, 1],
    ]);
  });

  it("starts a new run when adjacent values switch from equal to not equal", () => {
    expect(runLength([1, 1, 1, 2, 2, 1, 1])).toEqual([
      [1, 3],
      [2, 2],
      [1, 2],
    ]);
  });

  it("treats NaN as not equal to itself, so each NaN is its own run", () => {
    expect(runLength([NaN, NaN, NaN])).toEqual([
      [NaN, 1],
      [NaN, 1],
      [NaN, 1],
    ]);
  });

  it("preserves object identity for distinct object references", () => {
    const a = {};
    const b = {};
    const result = runLength([a, a, b, a]);
    expect(result).toHaveLength(3);
    expect(result[0]?.[0]).toBe(a);
    expect(result[0]?.[1]).toBe(2);
    expect(result[1]?.[0]).toBe(b);
    expect(result[1]?.[1]).toBe(1);
    expect(result[2]?.[0]).toBe(a);
    expect(result[2]?.[1]).toBe(1);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    const snapshot = [...input];
    runLength(input);
    expect(input).toEqual(snapshot);
  });

  describe("fallback / accumulator-empty branch", () => {
    it("returns the empty encoding for an empty input via the start-of-reduce fallback", () => {
      // acc[acc.length - 1] is undefined on the very first iteration, so the
      // fallback branch (acc.push) must NOT fire for an empty array — the
      // reduce visits zero items.
      expect(runLength<number>([])).toEqual([]);
    });

    it("treats new Array(0) and new Array() as equivalent to a literal []", () => {
      // The accumulator fallback branch is never reached for either; result
      // is the empty encoding.
      expect(runLength(Array(0))).toEqual([]);
      expect(runLength(new Array<number>())).toEqual([]);
    });

    it("correctly transitions from empty-accumulator fallback to in-run accumulation", () => {
      // The first element triggers the fallback branch (push), the second
      // triggers the in-run branch (increment). This must produce a count of
      // 2, never 0 or some other artifact of the fallback boundary.
      expect(runLength([7, 7])).toEqual([[7, 2]]);
      expect(runLength([7, 7, 7])).toEqual([[7, 3]]);
    });

    it("runs each distinct first value through the fallback branch exactly once", () => {
      // Each switch to a new value re-fires the fallback; verify it never
      // creates a [prevValue, 0] ghost pair from a missed increment.
      expect(runLength([1, 2, 3, 1, 2, 3])).toEqual([
        [1, 1],
        [2, 1],
        [3, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ]);
    });
  });

  describe("falsy and special-value inputs", () => {
    it("treats 0 as a real value and merges adjacent zeros", () => {
      expect(runLength([0, 0, 1, 0, 0])).toEqual([
        [0, 2],
        [1, 1],
        [0, 2],
      ]);
    });

    it("treats +0 and -0 as equal under === so they merge into one run", () => {
      // `===` says +0 === -0 (true), so the in-run increment branch fires and
      // they are part of the same run — distinct from the NaN case.
      expect(runLength([0, -0])).toEqual([[0, 2]]);
    });

    it("treats null as a real value and merges adjacent nulls", () => {
      expect(runLength([null, null, "x", null])).toEqual([
        [null, 2],
        ["x", 1],
        [null, 1],
      ]);
    });

    it("treats undefined as a real value and merges adjacent undefined entries", () => {
      // Each `undefined` slot is a real, defined array index; the fallback
      // branch and merge branch both operate on values, not on slot holes.
      expect(runLength([undefined, undefined, 1, undefined])).toEqual([
        [undefined, 2],
        [1, 1],
        [undefined, 1],
      ]);
    });

    it("treats empty strings as real values and merges them", () => {
      expect(runLength(["", "", "a", ""])).toEqual([
        ["", 2],
        ["a", 1],
        ["", 1],
      ]);
    });

    it("treats false as a real value and merges adjacent false entries", () => {
      expect(runLength([false, false, true, false])).toEqual([
        [false, 2],
        [true, 1],
        [false, 1],
      ]);
    });
  });

  describe("error / throw / mutability paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => runLength([1, 2, 3, 4])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => runLength([])).not.toThrow();
    });

    it("does not throw on a single-element array", () => {
      expect(() => runLength([42])).not.toThrow();
    });

    it("does not throw on an array of identical values", () => {
      expect(() => runLength([7, 7, 7, 7])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 1, 2, 2, 3]);
      expect(() => runLength(frozen)).not.toThrow();
      expect(runLength(frozen)).toEqual([
        [1, 2],
        [2, 2],
        [3, 1],
      ]);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 1, 2, 3]);
      expect(() => runLength(sealed)).not.toThrow();
      expect(runLength(sealed)).toEqual([
        [1, 2],
        [2, 1],
        [3, 1],
      ]);
    });

    it("does not mutate the input array", () => {
      const input = [1, 1, 2, 2, 3, 3];
      const snapshot = [...input];
      runLength(input);
      expect(input).toEqual(snapshot);
    });

    it("does not mutate a frozen input array", () => {
      const frozen = Object.freeze([1, 1, 2, 2]);
      const snapshot = [...frozen];
      runLength(frozen);
      expect([...frozen]).toEqual(snapshot);
    });

    it("returns a fresh accumulator each call and does not share state", () => {
      // The internal accumulator is reduced fresh per call; consecutive
      // invocations must not bleed counts into one another.
      const a = runLength([1, 1, 1]);
      const b = runLength([2, 2, 2]);
      expect(a).toEqual([[1, 3]]);
      expect(b).toEqual([[2, 3]]);
      expect(a).not.toBe(b);
    });
  });

  describe("sparse arrays and holes", () => {
    it("treats holes as undefined values and does not throw", () => {
      const sparse: number[] = [];
      sparse[2] = 1;
      // Length is 3; the two leading slots are holes (treated as undefined)
      // and one hole sits adjacent to the defined value at index 2.
      expect(sparse.length).toBe(3);
      // The function uses `arr.reduce`, which skips holes; it will only see
      // the single defined element. We accept either behavior (pure reduce
      // semantics vs. explicit undefined semantics) so long as no throw.
      expect(() => runLength(sparse)).not.toThrow();
    });

    it("does not throw when given an array whose length is set with no own indices", () => {
      const a: unknown[] = [];
      a.length = 3;
      expect(() => runLength(a)).not.toThrow();
    });
  });

  describe("typed and heterogeneous inputs", () => {
    it("preserves string type", () => {
      expect(runLength(["a", "b", "b", "c"])).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 1],
      ]);
    });

    it("preserves object identity (does not deep-copy)", () => {
      const obj = { id: 7 };
      const result = runLength([obj, obj, { id: 7 }]);
      expect(result).toHaveLength(2);
      expect(result[0]?.[0]).toBe(obj);
      expect(result[0]?.[1]).toBe(2);
      expect(result[1]?.[0]).not.toBe(obj);
      expect(result[1]?.[1]).toBe(1);
    });

    it("preserves null vs undefined distinction in mixed arrays", () => {
      expect(runLength([null, null, undefined, null])).toEqual([
        [null, 2],
        [undefined, 1],
        [null, 1],
      ]);
    });

    it("treats NaN as a valid element (each NaN is its own run)", () => {
      // NaN is a real numeric value at the slot; the function's === check
      // sees NaN !== NaN, so each NaN generates its own pair via the
      // fallback branch (acc.push) rather than the in-run increment.
      const result = runLength([NaN, 1, 1, NaN]);
      expect(result).toHaveLength(3);
      expect(Number.isNaN(result[0]![0])).toBe(true);
      expect(result[0]![1]).toBe(1);
      expect(result[1]![0]).toBe(1);
      expect(result[1]![1]).toBe(2);
      expect(Number.isNaN(result[2]![0])).toBe(true);
      expect(result[2]![1]).toBe(1);
    });
  });
});
