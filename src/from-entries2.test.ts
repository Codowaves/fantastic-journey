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

  it("propagates an error thrown by the iterable", () => {
    const error = new Error("iter blew up");
    const throwing: Iterable<readonly [string, number]> = {
      [Symbol.iterator]() {
        let i = 0;
        return {
          next() {
            i += 1;
            if (i === 1) {
              return { value: ["a", 1], done: false } as const;
            }
            throw error;
          },
        };
      },
    };
    expect(() => fromEntries2(throwing)).toThrow("iter blew up");
  });

  it("propagates an error thrown during iteration after the first pair", () => {
    const boom = new RangeError("bad value");
    function* gen(): IterableIterator<readonly [string, number]> {
      yield ["x", 1];
      throw boom;
    }
    expect(() => fromEntries2(gen())).toThrow(boom);
  });

  it("propagates an error thrown by an iterable that errors before yielding", () => {
    const boom = new TypeError("empty but angry");
    const angryEmpty: Iterable<readonly [string, number]> = {
      [Symbol.iterator]() {
        return {
          next() {
            throw boom;
          },
        };
      },
    };
    expect(() => fromEntries2(angryEmpty)).toThrow(TypeError);
    expect(() => fromEntries2(angryEmpty)).toThrow("empty but angry");
  });

  it("does not produce a partial result when iteration throws partway through", () => {
    function* gen(): IterableIterator<readonly [string, number]> {
      yield ["a", 1];
      yield ["b", 2];
      throw new Error("stop");
    }
    let captured: unknown;
    try {
      fromEntries2(gen());
    } catch (err) {
      captured = err;
    }
    expect(captured).toBeInstanceOf(Error);
  });
});
