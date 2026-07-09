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

  it("groups all items into one bucket when the key function always returns the same value", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(groupBy(items, () => "x")).toEqual({
      x: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });
  });

  it("supports numeric keys that look like array indices", () => {
    const result = groupBy([10, 20, 30], (n) => n / 10);
    expect(result["1"]).toEqual([10]);
    expect(result["2"]).toEqual([20]);
    expect(result["3"]).toEqual([30]);
  });

  it("supports symbol keys", () => {
    const a = Symbol("a");
    const b = Symbol("b");
    const result = groupBy([1, 2, 3], (n) => (n === 1 ? a : b));
    expect(result[a]).toEqual([1]);
    expect(result[b]).toEqual([2, 3]);
  });

  it("groups by an explicit undefined key", () => {
    const items = [1, 2, 3];
    const result = groupBy(items, (n) =>
      n === 2 ? (undefined as unknown as string) : "k",
    );
    expect(result["k"]).toEqual([1, 3]);
    expect(result["undefined"]).toEqual([2]);
  });

  it("throws when the key function throws", () => {
    expect(() =>
      groupBy([1, 2, 3], (n) => {
        if (n === 2) throw new Error("boom");
        return n;
      }),
    ).toThrow("boom");
  });

  it("does not mutate the input array", () => {
    const items = [1, 2, 3, 4];
    const snapshot = [...items];
    groupBy(items, (n) => n % 2);
    expect(items).toEqual(snapshot);
  });

  it("returns a fresh object on each call", () => {
    const items = [1, 2];
    const a = groupBy(items, (n) => n);
    const b = groupBy(items, (n) => n);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
