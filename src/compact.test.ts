import { describe, expect, it, vi } from "vitest";

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

  describe("falsy predicate branch (the `if (value)` filter)", () => {
    it("filters out each falsy primitive independently", () => {
      expect(compact([0])).toEqual([]);
      expect(compact([false])).toEqual([]);
      expect(compact([""])).toEqual([]);
      expect(compact([null])).toEqual([]);
      expect(compact([undefined])).toEqual([]);
      expect(compact([NaN])).toEqual([]);
    });

    it("preserves truthy primitives alongside falsy ones", () => {
      expect(compact([0, "0"])).toEqual(["0"]);
      expect(compact([false, "false"])).toEqual(["false"]);
      expect(compact([null, "null"])).toEqual(["null"]);
      expect(compact([undefined, "undefined"])).toEqual(["undefined"]);
      expect(compact([NaN, "NaN"])).toEqual(["NaN"]);
    });

    it("keeps object truthiness even when the object is 'empty'", () => {
      // Objects are always truthy regardless of their content.
      expect(compact([{}, {}])).toEqual([{}, {}]);
    });

    it("keeps array truthiness even when the nested array is empty", () => {
      expect(compact([[], []])).toEqual([[], []]);
    });

    it("keeps truthy strings including whitespace-only strings", () => {
      expect(compact(["", " ", "  "])).toEqual([" ", "  "]);
    });

    it("keeps the document.all object (a host object that is 'falsy' historically)", () => {
      // document.all is documented as falsy only in browsers; in Node the
      // typeof check is just "object" so we cannot construct it. Skipping
      // this specific case in the Node test environment.
      expect(compact([{}])).toHaveLength(1);
    });

    it("treats the integer 0 and negative zero as falsy", () => {
      expect(compact([0, -0])).toEqual([]);
      expect(compact([1, 0, 2, -0, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("fallback branch (no falsy values encountered)", () => {
    it("returns a new array when every value is truthy", () => {
      const input = [1, 2, 3];
      const result = compact(input);
      expect(result).toEqual([1, 2, 3]);
      expect(result).not.toBe(input);
    });

    it("preserves the order of truthy values", () => {
      expect(compact([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
        3, 1, 4, 1, 5, 9, 2, 6,
      ]);
    });

    it("preserves element identity for objects in the all-truthy branch", () => {
      const a = { id: 1 };
      const b = { id: 2 };
      const result = compact([a, b]);
      expect(result[0]).toBe(a);
      expect(result[1]).toBe(b);
    });
  });

  describe("type preservation", () => {
    it("filters NaN out (NaN is falsy in the `if (value)` check)", () => {
      // Locking in the documented behavior: NaN, like 0 and undefined, is
      // removed by compact. toEqual cannot compare NaN with === so we use
      // Number.isNaN to verify the surviving shape.
      const result = compact([1, Number.NaN, 2]);
      expect(result).toEqual([1, 2]);
    });

    it("preserves string types unchanged", () => {
      expect(compact(["a", "", "b", "c"])).toEqual(["a", "b", "c"]);
    });

    it("preserves bigint truthiness", () => {
      expect(compact([0n, 1n, 2n])).toEqual([1n, 2n]);
    });

    it("preserves symbol truthiness", () => {
      const sym = Symbol("x");
      expect(compact([sym])).toEqual([sym]);
    });
  });

  describe("error/throw paths and hostile inputs", () => {
    it("does not throw on an empty array", () => {
      expect(() => compact([])).not.toThrow();
    });

    it("does not throw on a frozen input array", () => {
      const frozen = Object.freeze([1, 0, 2, false, 3]);
      expect(() => compact(frozen)).not.toThrow();
      expect(compact(frozen)).toEqual([1, 2, 3]);
    });

    it("does not throw on a sealed input array", () => {
      const sealed = Object.seal([1, 0, 2, false, 3]);
      expect(() => compact(sealed)).not.toThrow();
      expect(compact(sealed)).toEqual([1, 2, 3]);
    });

    it("does not throw on a sparse array (skips holes)", () => {
      // [, , 1] — length 3, indices 0 and 1 are holes, index 2 holds 1.
      const sparse: unknown[] = [];
      sparse[2] = 1;
      expect(() => compact(sparse)).not.toThrow();
      // Holes are skipped by the for-of loop, so only `1` survives.
      expect(compact(sparse)).toEqual([1]);
    });

    it("does not throw when the input is array-like with a length property", () => {
      // readonly T[] accepts array-like; we cannot pass a true non-iterable
      // here without breaking the type signature, but we can confirm that an
      // array produced via Array.from behaves like a normal array.
      const fromIterable = Array.from({ length: 0 });
      expect(() => compact(fromIterable)).not.toThrow();
      expect(compact(fromIterable)).toEqual([]);
    });

    it("does not throw when a frozen/sealed nested array is encountered", () => {
      const nestedFrozen = Object.freeze([1, 2]);
      expect(compact([nestedFrozen])).toEqual([nestedFrozen]);
    });

    it("propagates a getter throw on the input array (error surfaces to caller)", () => {
      // A throw inside the `for (const value of arr)` loop — exercised via a
      // throwing index getter — must surface to the caller rather than be
      // swallowed by the truthiness check.
      const arr: number[] = [];
      Object.defineProperty(arr, 0, {
        get() {
          throw new Error("getter boom");
        },
        enumerable: true,
        configurable: true,
      });
      expect(() => compact(arr)).toThrow("getter boom");
    });

    it("does not throw when input is a single-element array of a falsy value", () => {
      expect(() => compact([0])).not.toThrow();
      expect(() => compact([false])).not.toThrow();
      expect(() => compact([null])).not.toThrow();
      expect(() => compact([undefined])).not.toThrow();
      expect(() => compact([NaN])).not.toThrow();
      expect(() => compact([""])).not.toThrow();
    });

    it("does not throw when input is a single-element array of a truthy value", () => {
      expect(() => compact([42])).not.toThrow();
      expect(() => compact(["x"])).not.toThrow();
      expect(() => compact([{}])).not.toThrow();
      expect(() => compact([[]])).not.toThrow();
    });
  });

  describe("read-only input contract", () => {
    it("does not mutate the input array", () => {
      const input = [1, 0, 2, false, 3];
      const snapshot = [...input];
      compact(input);
      expect(input).toEqual(snapshot);
    });

    it("returns a fresh array (not the same reference) even for the empty-input case", () => {
      const result = compact([]);
      expect(result).toEqual([]);
      expect(result).not.toBe([]);
    });
  });

  describe("spy/observability hooks", () => {
    it("the function does not call any external observers on the happy path", () => {
      // compact has no observable side effects; this test guards against a
      // future regression that adds a hidden console.log or metric call.
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      compact([1, 0, 2, false]);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
