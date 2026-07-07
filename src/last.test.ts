import { describe, expect, it } from "vitest";

import { last } from "./last";

describe("last", () => {
  it("returns the final element of a non-empty array", () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it("returns undefined for an empty array", () => {
    expect(last([])).toBeUndefined();
  });

  describe("fallback branch (empty / undefined index)", () => {
    it("returns undefined for an array of length 0 produced by Array(0)", () => {
      expect(last(Array(0))).toBeUndefined();
    });

    it("returns undefined for an array produced by new Array()", () => {
      expect(last(new Array<number>())).toBeUndefined();
    });

    it("returns undefined when the last index holds an explicit undefined value", () => {
      // The fallback branch and the in-bounds branch both produce undefined;
      // locking in that explicit undefined at index n is indistinguishable
      // from the empty-array fallback.
      expect(last([undefined])).toBeUndefined();
      expect(last([1, 2, undefined])).toBeUndefined();
    });

    it("does not throw when the array is empty or all-undefined", () => {
      expect(() => last([])).not.toThrow();
      expect(() => last(Array(0))).not.toThrow();
      expect(() => last([undefined])).not.toThrow();
      expect(() => last([undefined, undefined])).not.toThrow();
    });
  });

  describe("sparse arrays and holes", () => {
    it("returns the trailing real value when the last index is defined", () => {
      const sparse: number[] = [];
      sparse[2] = 1;
      // Length is 3; index 2 holds the only real value at the tail.
      expect(sparse.length).toBe(3);
      expect(last(sparse)).toBe(1);
    });

    it("returns undefined when the last slot of a sparse array is a hole", () => {
      const sparse: number[] = [1, 2, 3];
      // Forcing the trailing slot to be a hole: the only defined value is at
      // index 1, but length-1 (index 2) is a hole — the fallback branch kicks
      // in for the missing slot.
      delete (sparse as number[])[2];
      expect(sparse.length).toBe(3);
      expect(2 in sparse).toBe(false);
      expect(last(sparse)).toBeUndefined();
    });

    it("returns undefined for an array with length set but no own indices", () => {
      const a: unknown[] = [];
      a.length = 3;
      expect(last(a)).toBeUndefined();
    });
  });

  describe("single-element array (smallest non-empty case)", () => {
    it("returns the only element", () => {
      expect(last([42])).toBe(42);
    });

    it("returns undefined for [undefined]", () => {
      expect(last([undefined])).toBeUndefined();
    });
  });

  describe("typed and heterogeneous inputs", () => {
    it("preserves string type", () => {
      expect(last(["a", "b", "c"])).toBe("c");
    });

    it("preserves object identity (does not deep-copy)", () => {
      const obj = { id: 7 };
      expect(last([{ id: 1 }, obj])).toBe(obj);
    });

    it("preserves null vs undefined distinction in mixed arrays", () => {
      expect(last([1, 2, null])).toBeNull();
      expect(last([1, 2, undefined])).toBeUndefined();
    });

    it("treats NaN as a valid last element", () => {
      // NaN is comparable via index access even though NaN !== NaN.
      expect(Number.isNaN(last([1, Number.NaN]))).toBe(true);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => last([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => last([])).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      expect(() => last(frozen)).not.toThrow();
      expect(last(frozen)).toBe(3);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 2, 3]) as number[];
      expect(() => last(sealed)).not.toThrow();
      expect(last(sealed)).toBe(3);
    });
  });
});
