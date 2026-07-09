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

  describe("edge cases", () => {
    it("maps a single-key object", () => {
      expect(mapValues({ only: 7 }, (n) => n + 3)).toEqual({ only: 10 });
    });

    it("maps null values to null", () => {
      expect(mapValues<null, null>({ a: null, b: null }, (v) => v)).toEqual({
        a: null,
        b: null,
      });
    });

    it("maps undefined values to undefined", () => {
      expect(
        mapValues<undefined, undefined>({ a: undefined }, (v) => v),
      ).toEqual({ a: undefined });
    });

    it("maps falsy values (0, '', false) through the function", () => {
      expect(
        mapValues<number | string | boolean, number>(
          { a: 0, b: "", c: false },
          (v) => Number(v),
        ),
      ).toEqual({ a: 0, b: 0, c: 0 });
    });

    it("preserves keys with special characters", () => {
      expect(mapValues({ "k-1": 1, "k.2": 2, " ": 3 }, (n) => n * 2)).toEqual({
        "k-1": 2,
        "k.2": 4,
        " ": 6,
      });
    });

    it("preserves keys that are numeric strings", () => {
      expect(
        mapValues({ "0": "a", "1": "b", "10": "c" }, (s) => s.toUpperCase()),
      ).toEqual({ "0": "A", "1": "B", "10": "C" });
    });

    it("invokes the function exactly once per own enumerable key", () => {
      const fn = vi.fn((n: number) => n * 2);
      mapValues({ a: 1, b: 2, c: 3 }, fn);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("returns a new object instance, not the input", () => {
      const input = { a: 1 };
      const output = mapValues(input, (n) => n);
      expect(output).not.toBe(input);
      expect(output).toEqual(input);
    });

    it("handles functions returning the same value (identity-like)", () => {
      expect(mapValues({ a: 1, b: 2 }, (n) => n)).toEqual({ a: 1, b: 2 });
    });

    it("handles the function returning objects", () => {
      expect(mapValues({ a: 1, b: 2 }, (n) => ({ doubled: n * 2 }))).toEqual({
        a: { doubled: 2 },
        b: { doubled: 4 },
      });
    });

    it("passes values and keys in insertion order", () => {
      const seen: Array<[string, number]> = [];
      mapValues({ z: 1, a: 2, m: 3 }, (v, k) => {
        seen.push([k, v]);
        return v;
      });
      expect(seen).toEqual([
        ["z", 1],
        ["a", 2],
        ["m", 3],
      ]);
    });
  });
});
