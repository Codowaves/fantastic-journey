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
    it("does not call pred for an empty array", () => {
      const pred = (() => {
        throw new Error("pred should not be called for empty input");
      }) as (a: number, b: number) => boolean;
      expect(() => chunkWhile<number>([], pred)).not.toThrow();
      expect(chunkWhile<number>([], pred)).toEqual([]);
    });

    it("does not call pred for a single-element array", () => {
      const calls: Array<[number, number]> = [];
      const pred = (a: number, b: number) => {
        calls.push([a, b]);
        return a === b;
      };
      expect(() => chunkWhile([42], pred)).not.toThrow();
      expect(calls).toEqual([]);
    });

    it("propagates an Error thrown by pred on the first adjacent pair", () => {
      const boom = new Error("predicate failed on pair");
      const pred = (() => {
        throw boom;
      }) as (a: number, b: number) => boolean;
      expect(() => chunkWhile([1, 2, 3], pred)).toThrow(boom);
    });

    it("propagates an Error thrown by pred mid-iteration and stops processing", () => {
      const seen: Array<[number, number]> = [];
      const pred = (a: number, b: number) => {
        seen.push([a, b]);
        if (a === 1 && b === 2) {
          throw new Error("explode on second pair");
        }
        return a === b;
      };
      expect(() => chunkWhile([1, 1, 2, 2, 3], pred)).toThrow(
        "explode on second pair",
      );
      // pred was called for [1,1] and [1,2]; the loop bailed on the throw
      // before reaching [2,2] or [2,3].
      expect(seen).toEqual([
        [1, 1],
        [1, 2],
      ]);
    });

    it("propagates a thrown non-Error value from pred", () => {
      const pred = (() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "string-sentinel";
      }) as (a: number, b: number) => boolean;
      expect(() => chunkWhile([1, 2], pred)).toThrow("string-sentinel");
    });

    it("propagates a thrown TypeError from pred", () => {
      const pred = (() => {
        throw new TypeError("bad comparison");
      }) as (a: number, b: number) => boolean;
      expect(() => chunkWhile([1, 2, 3], pred)).toThrow(TypeError);
      expect(() => chunkWhile([1, 2, 3], pred)).toThrow("bad comparison");
    });

    it("does not throw when the input is empty regardless of pred", () => {
      const pred = (() => {
        throw new Error("never called");
      }) as (a: number, b: number) => boolean;
      expect(() => chunkWhile<number>([], pred)).not.toThrow();
    });
  });
});
