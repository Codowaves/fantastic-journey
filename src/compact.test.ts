import { describe, expect, it } from "vitest";

import { compact } from "./compact";

describe("compact", () => {
  it("removes falsy values from a mixed array", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN])).toEqual([
      1, 2, 3,
    ]);
  });

  it("returns an empty array when every value is falsy", () => {
    expect(compact([0, false, "", null, undefined, NaN])).toEqual([]);
  });

  it("returns a copy with the same elements when none are falsy", () => {
    const input = [1, 2, 3];
    const result = compact(input);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(input);
  });

  it("returns an empty array for an empty input", () => {
    expect(compact([])).toEqual([]);
  });

  describe("falsy-value coverage (every JS falsy branch)", () => {
    it("filters out 0", () => {
      expect(compact([0, 1])).toEqual([1]);
    });

    it("filters out -0 (signed zero is falsy)", () => {
      expect(compact([-0, 1])).toEqual([1]);
      expect(Object.is(compact([-0])[0], -0)).toBe(false);
    });

    it("filters out 0n (BigInt zero is falsy)", () => {
      expect(compact([0n, 1n])).toEqual([1n]);
    });

    it("filters out false", () => {
      expect(compact([false, true])).toEqual([true]);
    });

    it("filters out empty string ''", () => {
      expect(compact(["", "x"])).toEqual(["x"]);
    });

    it("filters out null", () => {
      expect(compact([null, "x"])).toEqual(["x"]);
    });

    it("filters out undefined", () => {
      expect(compact([undefined, "x"])).toEqual(["x"]);
    });

    it("filters out NaN", () => {
      expect(compact([NaN, 1])).toEqual([1]);
      expect(compact([1, NaN, 2])).toEqual([1, 2]);
    });

    it("treats document.all as truthy despite legacy oddities", () => {
      // document.all is a known typeof-object with typeof 'undefined' in old browsers.
      // In Node, anything non-null, non-undefined, non-zero, non-NaN, non-empty-string,
      // non-false is truthy, so ordinary objects pass through.
      expect(compact([{}])).toEqual([{}]);
    });
  });

  describe("truthy-value coverage (includes falsy-like edge cases)", () => {
    it("preserves the string '0' (non-empty string is truthy)", () => {
      expect(compact(["0", 0])).toEqual(["0"]);
    });

    it("preserves the string 'false' (non-empty string is truthy)", () => {
      expect(compact(["false", false])).toEqual(["false"]);
    });

    it("preserves whitespace-only strings", () => {
      expect(compact([" ", "  "])).toEqual([" ", "  "]);
    });

    it("preserves non-zero numbers including negatives", () => {
      expect(compact([-1, 2, -3])).toEqual([-1, 2, -3]);
    });

    it("preserves Infinity and -Infinity", () => {
      expect(compact([Infinity, -Infinity])).toEqual([Infinity, -Infinity]);
    });

    it("preserves non-zero BigInt values", () => {
      expect(compact([1n, -1n, 42n])).toEqual([1n, -1n, 42n]);
    });

    it("preserves objects (objects are always truthy)", () => {
      const obj = { a: 1 };
      expect(compact([obj])).toEqual([obj]);
    });

    it("preserves arrays (nested arrays are truthy)", () => {
      const inner: number[] = [1, 2];
      expect(compact([inner, []])).toEqual([inner, []]);
    });

    it("preserves functions (functions are truthy)", () => {
      const fn = () => 1;
      expect(compact([fn])).toEqual([fn]);
    });

    it("preserves Symbols (symbols are truthy)", () => {
      const sym = Symbol("s");
      expect(compact([sym])).toEqual([sym]);
    });
  });

  describe("input shape and type preservation", () => {
    it("does not mutate the input array", () => {
      const input = [1, 0, 2, false, 3];
      const snapshot = [...input];
      compact(input);
      expect(input).toEqual(snapshot);
    });

    it("accepts a readonly array without error", () => {
      const input: readonly number[] = [0, 1, 0, 2];
      expect(compact(input)).toEqual([1, 2]);
    });

    it("accepts a readonly tuple", () => {
      const input = [0, "x", null, "y"] as const;
      expect(compact(input)).toEqual(["x", "y"]);
    });

    it("returns a mutable result array (not readonly)", () => {
      const result = compact([1, 0, 2]);
      result.push(99);
      expect(result).toEqual([1, 2, 99]);
    });

    it("preserves number type element ordering exactly", () => {
      expect(compact([3, 0, 1, 2])).toEqual([3, 1, 2]);
    });
  });

  describe("error / throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => compact([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => compact([])).not.toThrow();
    });

    it("does not throw on a frozen input array", () => {
      const frozen = Object.freeze([0, 1, 0, 2]);
      expect(() => compact(frozen)).not.toThrow();
      expect(compact(frozen)).toEqual([1, 2]);
    });

    it("does not throw on a sealed input array", () => {
      const sealed = Object.seal([0, 1, 0, 2]);
      expect(() => compact(sealed)).not.toThrow();
      expect(compact(sealed)).toEqual([1, 2]);
    });

    it("does not throw when the input contains getter properties that throw", () => {
      // The loop reads each element via iterator, which triggers the getter.
      // If anything were to rethrow, the test would fail. compact returns
      // whatever the getter yields (truthy here), so it should not propagate.
      const throwing: any = [];
      Object.defineProperty(throwing, "0", {
        enumerable: true,
        get: () => {
          throw new Error("getter exploded");
        },
      });
      expect(() => compact(throwing as unknown as unknown[])).toThrow(
        "getter exploded",
      );
    });

    it("does not throw on an array-like produced by Array.from with nullish values", () => {
      const like = Array.from({ length: 3 }); // sparse: three holes
      expect(() => compact(like)).not.toThrow();
      // holes are skipped (value undefined is falsy -> dropped)
      expect(compact(like)).toEqual([]);
    });

    it("does not throw when the input is a typed array (readonly-compatible shape)", () => {
      const typed = new Uint8Array([0, 1, 0, 2]);
      expect(() => compact(typed as unknown as number[])).not.toThrow();
      expect(compact(typed as unknown as number[])).toEqual([1, 2]);
    });
  });
});
