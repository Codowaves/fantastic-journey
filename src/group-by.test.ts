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

  it("does not mutate the input array", () => {
    const items = [1, 2, 3];
    const snapshot = [...items];
    groupBy(items, (n) => n);
    expect(items).toEqual(snapshot);
  });

  it("handles a single-item input", () => {
    expect(groupBy([42], (n) => n)).toEqual({ 42: [42] });
  });

  it("returns an empty object for empty input regardless of keyFn", () => {
    const calls: number[] = [];
    groupBy([], (n: number) => {
      calls.push(n);
      return n;
    });
    expect(calls).toEqual([]);
  });

  it("handles boolean keys via stringification in keyFn", () => {
    expect(groupBy([1, 2, 3, 4], (n) => String(n % 2 === 0))).toEqual({
      false: [1, 3],
      true: [2, 4],
    });
  });

  it("handles symbol keys", () => {
    const a = Symbol("a");
    const b = Symbol("b");
    const items = [
      { tag: a, v: 1 },
      { tag: b, v: 2 },
      { tag: a, v: 3 },
    ];
    const grouped = groupBy(items, (i) => i.tag);
    expect(grouped[a]).toEqual([
      { tag: a, v: 1 },
      { tag: a, v: 3 },
    ]);
    expect(grouped[b]).toEqual([{ tag: b, v: 2 }]);
  });

  it("groups items with null and undefined keys into their own buckets", () => {
    const items = [1, null, 2, undefined, 3, null];
    const grouped = groupBy(items, (x) => x as unknown as number);
    expect(grouped["null"]).toEqual([null, null]);
    expect(grouped["undefined"]).toEqual([undefined]);
    expect(grouped[1]).toEqual([1]);
    expect(grouped[2]).toEqual([2]);
    expect(grouped[3]).toEqual([3]);
  });

  it("groups a single element of each key", () => {
    const items = ["a", "b", "c"];
    const grouped = groupBy(items, (s) => s);
    expect(grouped).toEqual({ a: ["a"], b: ["b"], c: ["c"] });
  });

  it("handles a large input array", () => {
    const items = Array.from({ length: 1000 }, (_, i) => i % 10);
    const grouped = groupBy(items, (n) => n);
    for (let i = 0; i < 10; i++) {
      expect(grouped[i]).toHaveLength(100);
    }
    expect(Object.keys(grouped)).toHaveLength(10);
  });

  it("treats NaN keys as a single bucket", () => {
    const items = [NaN, NaN, 1, NaN];
    const grouped = groupBy(items, (n) => n);
    expect(grouped[NaN as unknown as number]).toHaveLength(3);
    expect(grouped[1]).toEqual([1]);
  });
});
