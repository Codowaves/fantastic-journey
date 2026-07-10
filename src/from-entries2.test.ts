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
    it("propagates errors thrown by the source iterator on first iteration", () => {
      const boom: Iterable<readonly [string, number]> = {
        [Symbol.iterator]() {
          return {
            next() {
              throw new Error("kaboom");
            },
          };
        },
      };
      expect(() => fromEntries2(boom)).toThrow("kaboom");
    });

    it("propagates errors thrown mid-iteration after at least one pair succeeds", () => {
      const iterable = (function* () {
        yield ["a", 1] as const;
        yield ["b", 2] as const;
        throw new Error("mid-stream");
      })();
      expect(() => fromEntries2(iterable)).toThrow("mid-stream");
    });

    it("propagates errors thrown when a tuple element is accessed via a Proxy", () => {
      const it = (function* () {
        const inner: [string, number] = ["a", 1];
        yield new Proxy(inner, {
          get(t, p) {
            if (p === "1") {
              throw new Error("index-1-read-blocked");
            }
            return Reflect.get(t as object, p as string | symbol) as never;
          },
        });
      })();
      expect(() => fromEntries2(it)).toThrow("index-1-read-blocked");
    });

    it("coerces object keys via ToPropertyKey when assigning to the result", () => {
      const keyObj = {
        toString() {
          return "coerced";
        },
      };
      const out = fromEntries2([[keyObj, 7]] as Iterable<
        readonly [string, number]
      >);
      expect((out as Record<string, number>).coerced).toBe(7);
    });

    it("accepts Symbol keys (does not coerce and does not throw)", () => {
      const s = Symbol("k");
      const out = fromEntries2<symbol, number>([[s, 42]]);
      expect(out[s]).toBe(42);
    });

    it("does not throw when the value side is null", () => {
      expect(fromEntries2<string, null>([["a", null]])).toEqual({ a: null });
    });

    it("does not throw when the value side is undefined (overwrite keeps undefined)", () => {
      expect(
        fromEntries2<string, number | undefined>([
          ["a", 1],
          ["a", undefined],
        ]),
      ).toEqual({ a: undefined });
    });

    it("does not throw when a generator yields nothing (empty branch)", () => {
      const gen = (function* () {})();
      expect(() => fromEntries2(gen)).not.toThrow();
      expect(fromEntries2(gen)).toEqual({});
    });

    it("does not throw on an iterable returned by an arrow generator", () => {
      const make = (): Iterable<readonly [string, number]> =>
        (function* () {
          yield ["x", 1];
        })();
      expect(() => fromEntries2(make())).not.toThrow();
    });

    it("does not throw on a frozen input array (pairs are still readable)", () => {
      const frozen = Object.freeze([
        ["a", 1],
        ["b", 2],
      ]) as readonly (readonly [string, number])[];
      expect(() => fromEntries2(frozen)).not.toThrow();
      expect(fromEntries2(frozen)).toEqual({ a: 1, b: 2 });
    });

    it("does not throw on a sealed input array", () => {
      const sealed = Object.seal([
        ["a", 1],
        ["b", 2],
      ]) as readonly (readonly [string, number])[];
      expect(() => fromEntries2(sealed)).not.toThrow();
      expect(fromEntries2(sealed)).toEqual({ a: 1, b: 2 });
    });

    it("returns a plain object whose prototype is Object.prototype even with many keys", () => {
      const pairs: Array<readonly [string, number]> = [];
      for (let i = 0; i < 64; i++) pairs.push([`k${i}`, i]);
      const out = fromEntries2(pairs);
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
      expect(Object.keys(out)).toHaveLength(64);
    });

    it("does not throw when an assigned key collides with an inherited Object.prototype method name", () => {
      const out = fromEntries2<string, number>([["toString", 100]]);
      expect(() => fromEntries2([["toString", 100]])).not.toThrow();
      expect(Object.prototype.hasOwnProperty.call(out, "toString")).toBe(true);
      expect(() => (out.toString as unknown as () => string)()).toThrow();
    });
  });
});
