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
});
