import { describe, expect, it, vi } from "vitest";

import { mapValues } from "./map-values";

describe("mapValues", () => {
  it("maps each value through the function", () => {
    expect(mapValues({ a: 1, b: 2, c: 3 }, (n) => n * 2)).toEqual({
      a: 2,
      b: 4,
      c: 6,
    });
  });

  it("passes the key as the second argument", () => {
    const result = mapValues({ a: 1, b: 2 }, (_value, key) =>
      key.toUpperCase(),
    );
    expect(result).toEqual({ a: "A", b: "B" });
  });

  it("returns an empty object for an empty input", () => {
    expect(mapValues({}, (n: number) => n * 2)).toEqual({});
  });

  it("does not mutate the input object", () => {
    const input = { a: 1, b: 2 };
    mapValues(input, (n) => n * 10);
    expect(input).toEqual({ a: 1, b: 2 });
  });

  it("can change the value type via the function", () => {
    const result = mapValues({ count: 1, total: 5 }, (n) => String(n));
    expect(result).toEqual({ count: "1", total: "5" });
  });

  it("returns an empty object for an empty input and never calls fn", () => {
    const fn = vi.fn((n: number) => n * 2);
    const result = mapValues({}, fn);
    expect(result).toEqual({});
    expect(fn).not.toHaveBeenCalled();
  });

  it("handles a single-key object", () => {
    expect(mapValues({ only: 7 }, (n) => n + 1)).toEqual({ only: 8 });
  });

  it("preserves the insertion order of keys", () => {
    const input = { z: 1, a: 2, m: 3, b: 4 };
    const result = mapValues(input, (n) => n * 10);
    expect(Object.keys(result)).toEqual(["z", "a", "m", "b"]);
    expect(result).toEqual({ z: 10, a: 20, m: 30, b: 40 });
  });

  it("maps null and undefined values without throwing", () => {
    const input: Record<string, unknown> = { a: null, b: undefined, c: 0 };
    const result = mapValues(input, (v) => (v == null ? "missing" : "ok"));
    expect(result).toEqual({ a: "missing", b: "missing", c: "ok" });
  });

  it("can produce null and undefined as output values", () => {
    const result = mapValues({ a: 1, b: 2, c: 3 }, (n) =>
      n % 2 === 0 ? null : undefined,
    );
    expect(result).toHaveProperty("a", undefined);
    expect(result).toHaveProperty("b", null);
    expect(result).toHaveProperty("c", undefined);
  });

  it("works with array values", () => {
    const input = { odds: [1, 3, 5], evens: [2, 4] };
    const result = mapValues(input, (arr) => arr.length);
    expect(result).toEqual({ odds: 3, evens: 2 });
  });

  it("works with nested object values", () => {
    const input = { user: { name: "Ada" }, meta: { id: 1 } };
    const result = mapValues(input, (obj) => JSON.stringify(obj));
    expect(result).toEqual({
      user: '{"name":"Ada"}',
      meta: '{"id":1}',
    });
  });

  it("returns a new object reference (not the same reference)", () => {
    const input = { a: 1 };
    const result = mapValues(input, (n) => n);
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  it("does not include inherited properties from the prototype chain", () => {
    const proto = { inherited: 99 };
    const input = Object.create(proto) as Record<string, number>;
    input.own = 1;
    const result = mapValues(input, (n) => n * 2);
    expect(result).toEqual({ own: 2 });
    expect("inherited" in result).toBe(false);
  });

  it("only iterates own enumerable string-keyed properties", () => {
    const input: Record<string, number> = { a: 1, b: 2 };
    Object.defineProperty(input, "hidden", {
      value: 99,
      enumerable: false,
      writable: true,
      configurable: true,
    });
    const result = mapValues(input, (n) => n * 2);
    expect(result).toEqual({ a: 2, b: 4 });
    expect("hidden" in result).toBe(false);
  });

  it("handles numeric and special-character string keys", () => {
    const input: Record<string, number> = {
      "0": 10,
      "1": 20,
      "with-dash": 30,
      "with space": 40,
      "": 50,
    };
    const result = mapValues(input, (n) => n + 1);
    expect(result).toEqual({
      "0": 11,
      "1": 21,
      "with-dash": 31,
      "with space": 41,
      "": 51,
    });
  });

  it("does not call fn on properties added to the result during iteration", () => {
    const input = { a: 1, b: 2 };
    const fn = vi.fn((n: number) => {
      return n;
    });
    mapValues(input, fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls.map((c) => c[0])).toEqual([1, 2]);
  });

  it("passes both value and key to fn in every invocation", () => {
    const calls: Array<[unknown, string]> = [];
    mapValues({ x: 10, y: 20 }, (v, k) => {
      calls.push([v, k]);
      return v;
    });
    expect(calls).toEqual([
      [10, "x"],
      [20, "y"],
    ]);
  });

  it("propagates exceptions thrown by fn", () => {
    expect(() =>
      mapValues({ a: 1 }, () => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
  });
});
