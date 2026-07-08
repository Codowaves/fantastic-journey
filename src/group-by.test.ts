import { describe, expect, it } from "vitest";

import { groupBy } from "./group-by";

describe("groupBy", () => {
  it("groups items by a string key", () => {
    const items = [
      { type: "fruit", name: "apple" },
      { type: "veg", name: "carrot" },
      { type: "fruit", name: "banana" },
    ];
    expect(groupBy(items, (i) => i.type)).toEqual({
      fruit: [
        { type: "fruit", name: "apple" },
        { type: "fruit", name: "banana" },
      ],
      veg: [{ type: "veg", name: "carrot" }],
    });
  });

  it("groups items by a numeric key", () => {
    expect(groupBy([1, 2, 3, 4, 5, 6], (n) => n % 3)).toEqual({
      0: [3, 6],
      1: [1, 4],
      2: [2, 5],
    });
  });

  it("returns an empty object for an empty input", () => {
    expect(groupBy([], (n: number) => n)).toEqual({});
  });

  it("puts every item into a single group when all keys match", () => {
    const items = [1, 2, 3];
    expect(groupBy(items, () => "all")).toEqual({ all: [1, 2, 3] });
  });

  it("preserves input order within each group", () => {
    const items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    const grouped = groupBy(items, (n) => n);
    expect(grouped[3]).toEqual([3, 3]);
    expect(grouped[1]).toEqual([1, 1]);
    expect(grouped[5]).toEqual([5, 5, 5]);
  });

  it("handles a single-item input", () => {
    expect(groupBy([42], (n) => n)).toEqual({ 42: [42] });
  });

  it("groups by an empty-string key", () => {
    expect(groupBy(["a", "b", "c"], () => "")).toEqual({ "": ["a", "b", "c"] });
  });

  it("treats the numeric key 0 as a valid group", () => {
    expect(groupBy([0, 1, 2, 3], (n) => n % 2)).toEqual({
      0: [0, 2],
      1: [1, 3],
    });
  });

  it("groups by negative numeric keys", () => {
    expect(groupBy([1, -1, 2, -2], (n) => n)).toEqual({
      1: [1],
      "-1": [-1],
      2: [2],
      "-2": [-2],
    });
  });

  it("groups by boolean keys", () => {
    expect(groupBy([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual({
      true: [2, 4],
      false: [1, 3],
    });
  });

  it("groups by symbol keys", () => {
    const A = Symbol("a");
    const B = Symbol("b");
    expect(groupBy(["x", "y", "z"], (s) => (s === "x" ? A : B))).toEqual({
      [A]: ["x"],
      [B]: ["y", "z"],
    });
  });

  it("coerces numeric string keys into number buckets when used as object keys", () => {
    const grouped = groupBy([1, 2, 3, 4, 5, 6], (n) => String(n % 2));
    expect(grouped["0"]).toEqual([2, 4, 6]);
    expect(grouped["1"]).toEqual([1, 3, 5]);
  });

  it("does not mutate the input array", () => {
    const items = [1, 2, 3, 4];
    const snapshot = [...items];
    groupBy(items, (n) => n % 2);
    expect(items).toEqual(snapshot);
  });

  it("returns independent bucket arrays (mutating one does not affect another)", () => {
    const grouped = groupBy([1, 2, 3, 4], (n) => n % 2);
    grouped[0].push(99);
    expect(grouped[0]).toEqual([2, 4, 99]);
    expect(grouped[1]).toEqual([1, 3]);
  });

  it("preserves object identity (does not deep-clone items)", () => {
    const a = { id: 1 };
    const b = { id: 2 };
    const grouped = groupBy([a, b], (x) => x.id);
    expect(grouped[1][0]).toBe(a);
    expect(grouped[2][0]).toBe(b);
  });
});
