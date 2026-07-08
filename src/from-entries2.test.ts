import { describe, expect, it } from "vitest";

import { fromEntries2 } from "./from-entries2";

describe("fromEntries2", () => {
  it("builds an object from [k, v] pairs", () => {
    expect(
      fromEntries2([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]),
    ).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("returns an empty object for empty input", () => {
    expect(fromEntries2([])).toEqual({});
  });

  it("handles an empty iterable (generator)", () => {
    expect(
      fromEntries2((function* () {})() as Iterable<readonly [string, number]>),
    ).toEqual({});
  });

  it("later pairs overwrite earlier ones with the same key", () => {
    expect(
      fromEntries2<string, number>([
        ["a", 1],
        ["b", 2],
        ["a", 99],
      ]),
    ).toEqual({ a: 99, b: 2 });
  });

  it("works with numeric keys", () => {
    expect(
      fromEntries2<number, string>([
        [1, "one"],
        [2, "two"],
      ]),
    ).toEqual({ 1: "one", 2: "two" });
  });

  it("works with mixed value types (typed as unknown)", () => {
    expect(
      fromEntries2<string, unknown>([
        ["name", "alice"],
        ["age", 30],
        ["active", true],
      ]),
    ).toEqual({ name: "alice", age: 30, active: true });
  });

  it("consumes an arbitrary iterable (Set of tuples)", () => {
    const pairs = new Set<readonly [string, number]>();
    pairs.add(["x", 10]);
    pairs.add(["y", 20]);
    expect(fromEntries2(pairs)).toEqual({ x: 10, y: 20 });
  });

  it("preserves undefined values", () => {
    expect(
      fromEntries2<string, number | undefined>([
        ["a", 1],
        ["b", undefined],
      ]),
    ).toEqual({ a: 1, b: undefined });
  });

  it("returns a fresh object on each call", () => {
    const a = fromEntries2<number, number>([[1, 1]]);
    const b = fromEntries2<number, number>([[1, 1]]);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal pair list", () => {
      expect(() =>
        fromEntries2([
          ["a", 1],
          ["b", 2],
        ]),
      ).not.toThrow();
    });

    it("does not throw on an empty input", () => {
      expect(() => fromEntries2([])).not.toThrow();
      expect(() =>
        fromEntries2(
          (function* () {})() as Iterable<readonly [string, number]>,
        ),
      ).not.toThrow();
    });

    it("does not throw when consuming a frozen array of pairs", () => {
      const frozen = Object.freeze([
        ["a", 1],
        ["b", 2],
      ]) as readonly (readonly [string, number])[];
      expect(() => fromEntries2(frozen)).not.toThrow();
      expect(fromEntries2(frozen)).toEqual({ a: 1, b: 2 });
    });

    it("does not throw when consuming a sealed array of pairs", () => {
      const sealed = Object.seal([
        ["x", 10],
        ["y", 20],
      ]) as [string, number][];
      expect(() => fromEntries2(sealed)).not.toThrow();
      expect(fromEntries2(sealed)).toEqual({ x: 10, y: 20 });
    });

    it("does not throw when consuming a frozen Set of tuples", () => {
      const pairs = new Set<readonly [string, number]>([
        ["a", 1],
        ["b", 2],
      ]);
      Object.freeze(pairs);
      expect(() => fromEntries2(pairs)).not.toThrow();
      expect(fromEntries2(pairs)).toEqual({ a: 1, b: 2 });
    });

    it("does not throw when the iterable's iterator throws partway through", () => {
      const throwing = {
        *[Symbol.iterator]() {
          yield ["a", 1] as const;
          yield ["b", 2] as const;
          throw new Error("boom");
        },
      };
      expect(() =>
        fromEntries2(throwing as Iterable<readonly [string, number]>),
      ).toThrow("boom");
    });

    it("propagates errors from the underlying iterator instead of swallowing them", () => {
      const throwing: Iterable<readonly [string, number]> = {
        [Symbol.iterator]() {
          throw new TypeError("not iterable enough");
        },
      };
      expect(() => fromEntries2(throwing)).toThrow(TypeError);
    });

    it("does not throw on Symbol keys", () => {
      const sym = Symbol("k");
      const out = fromEntries2<symbol, number>([[sym, 42]]);
      expect(out[sym]).toBe(42);
    });

    it("does not throw when values are null or undefined", () => {
      expect(
        fromEntries2<string, unknown>([
          ["n", null],
          ["u", undefined],
        ]),
      ).toEqual({ n: null, u: undefined });
    });

    it("does not mutate the input iterable while iterating", () => {
      const pairs: [string, number][] = [
        ["a", 1],
        ["b", 2],
      ];
      const snapshot = JSON.stringify(pairs);
      fromEntries2(pairs);
      expect(JSON.stringify(pairs)).toBe(snapshot);
    });
  });
});
