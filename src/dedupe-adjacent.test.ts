import { describe, expect, it } from "vitest";

import { dedupeAdjacent } from "./dedupe-adjacent";

describe("dedupeAdjacent", () => {
  it("collapses runs of equal numbers", () => {
    expect(dedupeAdjacent([1, 1, 2, 2, 2, 3, 1])).toEqual([1, 2, 3, 1]);
  });

  it("returns the same array when no adjacent duplicates exist", () => {
    expect(dedupeAdjacent([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns a single element when every item is the same", () => {
    expect(dedupeAdjacent([7, 7, 7, 7])).toEqual([7]);
  });

  it("preserves non-adjacent duplicates", () => {
    expect(dedupeAdjacent([1, 2, 1, 2, 1])).toEqual([1, 2, 1, 2, 1]);
  });

  it("handles strings", () => {
    expect(dedupeAdjacent(["a", "a", "b", "a", "a", "a", "c"])).toEqual([
      "a",
      "b",
      "a",
      "c",
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(dedupeAdjacent<string>([])).toEqual([]);
  });

  it("returns a single-element array for a one-item input", () => {
    expect(dedupeAdjacent([42])).toEqual([42]);
  });

  it("treats null as distinct from undefined", () => {
    expect(dedupeAdjacent([null, undefined, null, undefined])).toEqual([
      null,
      undefined,
      null,
      undefined,
    ]);
  });

  it("treats 0 and -0 as equal under strict equality", () => {
    expect(dedupeAdjacent([0, -0, 0])).toEqual([0]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    const copy = [...input];
    dedupeAdjacent(input);
    expect(input).toEqual(copy);
  });

  it("collapses adjacent duplicates of the same object reference", () => {
    const shared = { id: 1 };
    expect(dedupeAdjacent([shared, shared, shared])).toEqual([shared]);
  });

  it("preserves distinct object references even when adjacent", () => {
    const result = dedupeAdjacent([{ id: 1 }, { id: 1 }]);
    expect(result.length).toBe(2);
  });

  it("does not collapse consecutive NaN values", () => {
    expect(dedupeAdjacent([NaN, NaN, 1])).toEqual([NaN, NaN, 1]);
  });

  it("collapses runs of booleans", () => {
    expect(dedupeAdjacent([true, true, false, false, true])).toEqual([
      true,
      false,
      true,
    ]);
  });

  it("collapses runs of empty strings", () => {
    expect(dedupeAdjacent(["", "", "x", ""])).toEqual(["", "x", ""]);
  });

  it("handles all falsy primitive values", () => {
    expect(dedupeAdjacent([0, 0, "", "", false, false, null, null])).toEqual([
      0,
      "",
      false,
      null,
    ]);
  });

  it("preserves the boundary between a single non-run at the start", () => {
    expect(dedupeAdjacent([1, 2, 2, 2])).toEqual([1, 2]);
  });

  it("preserves the boundary between a single non-run at the end", () => {
    expect(dedupeAdjacent([2, 2, 2, 3])).toEqual([2, 3]);
  });

  it("collapses runs in the middle of the array", () => {
    expect(dedupeAdjacent([1, 2, 2, 3])).toEqual([1, 2, 3]);
  });

  it("treats two adjacent runs of the same value as one merged run", () => {
    expect(dedupeAdjacent([1, 1, 2, 1, 1])).toEqual([1, 2, 1]);
  });

  it("handles a large alternating array without collapsing non-adjacent duplicates", () => {
    const input: number[] = [];
    for (let i = 0; i < 100; i++) input.push(i % 2);
    expect(dedupeAdjacent(input)).toEqual(input);
  });

  it("collapses a long run of identical items to a single element", () => {
    const input = new Array(100).fill("x");
    expect(dedupeAdjacent(input)).toEqual(["x"]);
  });

  it("does not mutate the input when it contains a long run", () => {
    const input = [1, 1, 1, 2, 3, 3];
    const copy = [...input];
    dedupeAdjacent(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array instance (does not return the input)", () => {
    const input = [1, 2, 3];
    const result = dedupeAdjacent(input);
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  describe("first-element branch (i === 0 always pushes)", () => {
    it("always pushes the very first element regardless of value", () => {
      expect(dedupeAdjacent([0])).toEqual([0]);
      expect(dedupeAdjacent([null])).toEqual([null]);
      expect(dedupeAdjacent([""])).toEqual([""]);
    });

    it("exercises the first-element branch on a run of identical items", () => {
      // Only index 0 satisfies `i === 0`; indices 1..n-1 take the comparison branch
      // and short-circuit to "skip".
      expect(dedupeAdjacent(["x", "x", "x", "x"])).toEqual(["x"]);
    });

    it("exercises the first-element branch on a single-element array", () => {
      expect(dedupeAdjacent([42])).toEqual([42]);
    });
  });

  describe("comparison branch (current !== result[result.length - 1])", () => {
    it("exercises the equality sub-branch (current === previous → skip)", () => {
      // Index 0 takes the `i === 0` short-circuit; index 1 enters the comparison
      // branch and skips because current === previous.
      expect(dedupeAdjacent([1, 1])).toEqual([1]);
    });

    it("exercises the inequality sub-branch (current !== previous → push)", () => {
      // Index 0 pushes via `i === 0`; index 1 pushes via the comparison branch.
      expect(dedupeAdjacent([1, 2])).toEqual([1, 2]);
    });

    it("alternates between pushing and skipping on a long mixed run", () => {
      // [a, a, b, b, a, a] -> [a, b, a]
      //   i=0 push (first), i=1 skip (eq), i=2 push (!eq),
      //   i=3 skip (eq), i=4 push (!eq), i=5 skip (eq).
      expect(dedupeAdjacent(["a", "a", "b", "b", "a", "a"])).toEqual([
        "a",
        "b",
        "a",
      ]);
    });

    it("toggles the push/skip branches on the same value across a non-adjacent gap", () => {
      // Index 1 takes the comparison branch and pushes because previous was 1
      // and current is 2.
      expect(dedupeAdjacent([1, 2, 1])).toEqual([1, 2, 1]);
    });
  });

  describe("type-coercion-free edge inputs (no throws, strict equality only)", () => {
    it("treats bigints strictly (BigInt(1) === BigInt(1))", () => {
      expect(dedupeAdjacent([1n, 1n, 2n])).toEqual([1n, 2n]);
    });

    it("treats symbols by reference identity (two distinct symbols remain distinct)", () => {
      const a = Symbol("a");
      const b = Symbol("a");
      expect(dedupeAdjacent([a, a, b])).toEqual([a, b]);
    });

    it("collapses adjacent identical symbols but preserves distinct symbol references", () => {
      const s = Symbol("shared");
      expect(dedupeAdjacent([s, s, s])).toEqual([s]);
    });

    it("treats mixed primitive types as distinct under strict equality", () => {
      expect(dedupeAdjacent([1, "1", true])).toEqual([1, "1", true]);
    });

    it("does not throw when input contains bigints", () => {
      expect(() => dedupeAdjacent([1n, 2n, 2n])).not.toThrow();
    });

    it("does not throw when input contains symbols", () => {
      expect(() => dedupeAdjacent([Symbol(), Symbol()])).not.toThrow();
    });
  });

  describe("object identity and reference-handling", () => {
    it("collapses adjacent same-reference objects to one entry", () => {
      const shared = { id: 1 };
      expect(dedupeAdjacent([shared, shared, { id: 2 }])).toEqual([
        shared,
        { id: 2 },
      ]);
    });

    it("preserves distinct object references that happen to be structurally equal", () => {
      const a = { id: 1 };
      const b = { id: 1 };
      const result = dedupeAdjacent([a, b]);
      expect(result.length).toBe(2);
      expect(result[0]).toBe(a);
      expect(result[1]).toBe(b);
    });

    it("does not throw when input contains function references", () => {
      const fn = () => 1;
      expect(() => dedupeAdjacent([fn, fn, () => 1])).not.toThrow();
    });
  });

  describe("non-mutating guarantees under frozen / sealed / readonly inputs", () => {
    it("does not throw or mutate a frozen array", () => {
      const frozen = Object.freeze([1, 1, 2, 2, 3]);
      expect(() => dedupeAdjacent(frozen)).not.toThrow();
      expect(Object.isFrozen(frozen)).toBe(true);
      expect(dedupeAdjacent(frozen)).toEqual([1, 2, 3]);
    });

    it("does not throw or mutate a sealed array", () => {
      const sealed = Object.seal([1, 1, 2, 2, 3]);
      expect(() => dedupeAdjacent(sealed)).not.toThrow();
      expect(Object.isSealed(sealed)).toBe(true);
      expect(dedupeAdjacent(sealed)).toEqual([1, 2, 3]);
    });

    it("does not throw on a readonly-typed input", () => {
      const ro: readonly number[] = [1, 1, 2, 2];
      expect(() => dedupeAdjacent(ro)).not.toThrow();
      expect(dedupeAdjacent(ro)).toEqual([1, 2]);
    });

    it("does not throw on a deeply frozen array", () => {
      const inner = Object.freeze({ x: 1 });
      const outer = Object.freeze([inner, inner, inner]);
      expect(() => dedupeAdjacent(outer)).not.toThrow();
    });
  });

  describe("edge-input fallbacks", () => {
    it("returns an empty array when fed Array(0)", () => {
      expect(dedupeAdjacent(Array(0))).toEqual([]);
    });

    it("returns an empty array when fed new Array()", () => {
      expect(dedupeAdjacent(new Array<number>())).toEqual([]);
    });

    it("returns an empty array for an explicitly-cleared array", () => {
      const a = [1, 2, 3];
      a.length = 0;
      expect(dedupeAdjacent(a)).toEqual([]);
    });

    it("does not throw on a length-only array with no own indices", () => {
      // `a.length = 5` on an empty array makes index reads return `undefined`,
      // so the loop iterates 5 times and yields [undefined] — locking in
      // current behavior. The important assertion here is the no-throw guarantee.
      const a: unknown[] = [];
      a.length = 5;
      expect(() => dedupeAdjacent(a)).not.toThrow();
      expect(dedupeAdjacent(a)).toEqual([undefined]);
    });

    it("handles a read-only ArrayLike without throwing", () => {
      const arrayLike: ArrayLike<number> = { 0: 1, 1: 1, 2: 2, length: 3 };
      expect(() =>
        dedupeAdjacent(arrayLike as unknown as number[]),
      ).not.toThrow();
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal array", () => {
      expect(() => dedupeAdjacent([1, 2, 3])).not.toThrow();
    });

    it("does not throw on an empty array", () => {
      expect(() => dedupeAdjacent([])).not.toThrow();
    });

    it("does not throw on a single-element array", () => {
      expect(() => dedupeAdjacent([1])).not.toThrow();
    });

    it("does not throw on an array of length set explicitly with no own indices", () => {
      expect(() => dedupeAdjacent(Array(5))).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([1, 1, 2]) as readonly number[];
      expect(() => dedupeAdjacent(frozen)).not.toThrow();
    });

    it("does not throw on a sealed array", () => {
      const sealed = Object.seal([1, 1, 2]) as readonly number[];
      expect(() => dedupeAdjacent(sealed)).not.toThrow();
    });

    it("does not throw when the array contains only undefined values", () => {
      expect(() =>
        dedupeAdjacent([undefined, undefined, undefined]),
      ).not.toThrow();
      expect(dedupeAdjacent([undefined, undefined, undefined])).toEqual([
        undefined,
      ]);
    });

    it("does not throw when the array contains only null values", () => {
      expect(() => dedupeAdjacent([null, null, null])).not.toThrow();
      expect(dedupeAdjacent([null, null, null])).toEqual([null]);
    });

    it("does not throw on a very large all-duplicate input", () => {
      const input = new Array(10_000).fill("x");
      expect(() => dedupeAdjacent(input)).not.toThrow();
      expect(dedupeAdjacent(input)).toEqual(["x"]);
    });

    it("does not throw on a very large all-unique input", () => {
      const input = Array.from({ length: 10_000 }, (_, i) => i);
      expect(() => dedupeAdjacent(input)).not.toThrow();
      expect(dedupeAdjacent(input)).toEqual(input);
    });
  });
});
