import { describe, expect, it } from "vitest";

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

  it("handles a single-key object", () => {
    expect(mapValues({ only: 42 }, (n) => n + 1)).toEqual({ only: 43 });
  });

  it("preserves falsy values", () => {
    expect(mapValues({ a: 0, b: "", c: false, d: null }, (v) => v)).toEqual({
      a: 0,
      b: "",
      c: false,
      d: null,
    });
  });

  it("maps values to undefined when the function returns undefined", () => {
    expect(
      mapValues<number, number | undefined>({ a: 1, b: 2 }, () => undefined),
    ).toEqual({ a: undefined, b: undefined });
  });

  it("maps values to null when the function returns null", () => {
    expect(
      mapValues<number, number | null>({ a: 1, b: 2 }, () => null),
    ).toEqual({ a: null, b: null });
  });

  it("returns a new object reference, not the input", () => {
    const input = { a: 1 };
    const result = mapValues(input, (n) => n);
    expect(result).not.toBe(input);
  });

  it("handles array values", () => {
    expect(mapValues({ x: [1, 2], y: [3] }, (arr) => arr.length)).toEqual({
      x: 2,
      y: 1,
    });
  });

  it("handles keys with special characters", () => {
    expect(mapValues({ "k-1": 1, "k 2": 2, "k.3": 3 }, (n) => n * 10)).toEqual({
      "k-1": 10,
      "k 2": 20,
      "k.3": 30,
    });
  });

  it("invokes the function once per key, with correct value-key pairing", () => {
    const calls: Array<[unknown, string]> = [];
    mapValues({ x: 10, y: 20, z: 30 }, (value, key) => {
      calls.push([value, key]);
      return value;
    });
    expect(calls).toEqual([
      [10, "x"],
      [20, "y"],
      [30, "z"],
    ]);
  });
});
