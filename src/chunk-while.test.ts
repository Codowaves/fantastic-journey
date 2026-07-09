import { describe, expect, it } from "vitest";

import { chunkWhile } from "./chunk-while";

describe("chunkWhile", () => {
  it("groups consecutive runs of equal numbers", () => {
    expect(chunkWhile([1, 1, 2, 2, 2, 3, 1], (a, b) => a === b)).toEqual([
      [1, 1],
      [2, 2, 2],
      [3],
      [1],
    ]);
  });

  it("groups ascending runs while the next value is greater than the previous", () => {
    expect(chunkWhile([1, 2, 3, 2, 3, 4, 5, 1], (a, b) => a < b)).toEqual([
      [1, 2, 3],
      [2, 3, 4, 5],
      [1],
    ]);
  });

  it("treats every adjacent pair as a boundary when pred is always false", () => {
    expect(chunkWhile([1, 2, 3], () => false)).toEqual([[1], [2], [3]]);
  });

  it("returns a single chunk when pred is always true", () => {
    expect(chunkWhile([1, 2, 3, 4], () => true)).toEqual([[1, 2, 3, 4]]);
  });

  it("returns an empty array for an empty input", () => {
    expect(chunkWhile<number>([], () => true)).toEqual([]);
  });

  it("returns a single-element chunk for a single-item input", () => {
    expect(chunkWhile([42], () => true)).toEqual([[42]]);
  });

  it("returns two single-element chunks for a two-item input when pred is false", () => {
    expect(chunkWhile([1, 2], (a, b) => a === b)).toEqual([[1], [2]]);
  });

  it("returns one two-element chunk for a two-item input when pred is true", () => {
    expect(chunkWhile([1, 1], (a, b) => a === b)).toEqual([[1, 1]]);
  });

  it("chunks strings by prefix match", () => {
    expect(
      chunkWhile(
        ["apple", "apricot", "banana", "blueberry", "cherry"],
        (a, b) => a[0] === b[0],
      ),
    ).toEqual([["apple", "apricot"], ["banana", "blueberry"], ["cherry"]]);
  });

  it("chunks objects by reference identity, not structural equality", () => {
    const a = { id: 1 };
    const b = { id: 1 };
    expect(chunkWhile([a, b], (x, y) => x === y)).toEqual([[a], [b]]);
  });

  it("handles a final chunk after a boundary at the end", () => {
    expect(chunkWhile([1, 1, 2], (a, b) => a === b)).toEqual([[1, 1], [2]]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    chunkWhile(input, (a, b) => a === b);
    expect(input).toEqual([1, 1, 2, 2, 3]);
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => chunkWhile([1, 2, 3], (a, b) => a < b)).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => chunkWhile<number>([], () => true)).not.toThrow();
    });

    it("does not throw on a single-item array", () => {
      expect(() => chunkWhile([1], () => true)).not.toThrow();
    });

    it("propagates errors thrown by the predicate", () => {
      const sentinel = new Error("predicate exploded");
      expect(() =>
        chunkWhile([1, 2, 3], () => {
          throw sentinel;
        }),
      ).toThrow(sentinel);
    });

    it("propagates TypeError thrown by the predicate", () => {
      expect(() =>
        chunkWhile<unknown>([1, "two", 3], (a, b) => {
          if (typeof a !== "number" || typeof b !== "number") {
            throw new TypeError("expected numbers");
          }
          return (a as number) < (b as number);
        }),
      ).toThrow(TypeError);
    });

    it("propagates predicate errors thrown mid-iteration", () => {
      // Throws only on the second boundary so the first chunk must complete.
      const obs: number[] = [];
      expect(() =>
        chunkWhile([1, 2, 2, 3, 3, 3], (a, b) => {
          obs.push(a);
          if (a === 2 && b === 3) {
            throw new Error("boundary");
          }
          return a === b;
        }),
      ).toThrow("boundary");
      // pred was called at least once with a=2 before the throw.
      expect(obs).toContain(2);
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 1, 2, 2, 3]) as readonly number[];
      expect(() => chunkWhile(frozen, (a, b) => a === b)).not.toThrow();
      expect(chunkWhile(frozen, (a, b) => a === b)).toEqual([
        [1, 1],
        [2, 2],
        [3],
      ]);
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 1, 2]) as readonly number[];
      expect(() => chunkWhile(sealed, (a, b) => a === b)).not.toThrow();
      expect(chunkWhile(sealed, (a, b) => a === b)).toEqual([[1, 1], [2]]);
    });

    it("does not throw when the predicate returns truthy non-boolean values", () => {
      // Predicates that return truthy non-boolean values (e.g. 1, "yes")
      // should still be treated as truthy — same branch as `true`.
      expect(chunkWhile([1, 2, 3], () => 1 as unknown as boolean)).toEqual([
        [1, 2, 3],
      ]);
      expect(chunkWhile([1, 2, 3], () => "yes" as unknown as boolean)).toEqual([
        [1, 2, 3],
      ]);
    });

    it("does not throw when the predicate returns falsy non-boolean values", () => {
      // Falsy non-boolean values should be treated as false — every boundary
      // breaks the chunk.
      expect(chunkWhile([1, 2, 3], () => 0 as unknown as boolean)).toEqual([
        [1],
        [2],
        [3],
      ]);
      expect(chunkWhile([1, 2, 3], () => "" as unknown as boolean)).toEqual([
        [1],
        [2],
        [3],
      ]);
      expect(chunkWhile([1, 2, 3], () => null as unknown as boolean)).toEqual([
        [1],
        [2],
        [3],
      ]);
    });

    it("does not throw on a readonly typed array view", () => {
      const arr: readonly number[] = [1, 2, 2, 3];
      expect(() => chunkWhile(arr, (a, b) => a === b)).not.toThrow();
      expect(chunkWhile(arr, (a, b) => a === b)).toEqual([[1], [2, 2], [3]]);
    });

    it("survives a predicate that accesses properties of undefined elements without throwing", () => {
      // The element at index 2 is explicit `undefined`. A naive predicate
      // would dereference `.x` and throw — verifying the function does not
      // itself dereference elements is the point of this branch.
      expect(() =>
        chunkWhile<{ x?: number } | undefined>(
          [{ x: 1 }, undefined, { x: 3 }],
          (a, b) => a?.x === b?.x,
        ),
      ).not.toThrow();
    });

    it("returns empty array when called with an empty frozen array", () => {
      const frozen = Object.freeze([]) as readonly number[];
      expect(chunkWhile(frozen, () => true)).toEqual([]);
    });

    it("does not throw when the input has a length but no own indices (sparse-like)", () => {
      const a: number[] = [];
      a.length = 3;
      // arr[0] is undefined via index access on an array with length > 0
      // but no defined indices; we just confirm no crash.
      expect(() => chunkWhile(a as number[], (x, y) => x === y)).not.toThrow();
    });
  });
});
