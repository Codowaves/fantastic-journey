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

  describe("edge cases", () => {
    it("returns an empty object for an empty input array", () => {
      const result = groupBy([] as number[], (n) => n);
      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    it("groups a single-item array into one bucket", () => {
      expect(groupBy(["solo"], (s) => s)).toEqual({ solo: ["solo"] });
    });

    it("returns one bucket per distinct key when all keys are unique", () => {
      const items = [1, 2, 3];
      const result = groupBy(items, (n) => n);
      expect(result).toEqual({ 1: [1], 2: [2], 3: [3] });
    });

    it("does not mutate the input array", () => {
      const items = [1, 2, 1, 3];
      const snapshot = [...items];
      groupBy(items, (n) => n);
      expect(items).toEqual(snapshot);
    });

    it("supports a keyFn returning an empty string (valid PropertyKey)", () => {
      const items = ["a", "b", "c"];
      const result = groupBy(items, () => "");
      expect(result).toEqual({ "": ["a", "b", "c"] });
    });

    it("supports a keyFn returning the number 0", () => {
      const items = [10, 20, 30];
      const result = groupBy(items, (n) => n % 10);
      expect(result[0]).toEqual([10, 20, 30]);
      expect(Object.keys(result)).toEqual(["0"]);
    });

    it("does not share array references between groups", () => {
      const items = [{ k: 1 }, { k: 2 }];
      const result = groupBy(items, (o) => o.k);
      result[1]!.push({ k: 1 });
      expect(result[2]).toEqual([{ k: 2 }]);
    });

    it("coerces non-PropertyKey return values to strings", () => {
      // JS objects are not valid PropertyKeys but get coerced via toString.
      const items = [1, 2, 3];
      const result = groupBy(
        items,
        (() => ({}) as unknown as PropertyKey) as (n: number) => PropertyKey,
      );
      // All three items land in the same "[object Object]" bucket.
      expect(result["[object Object]"]).toEqual([1, 2, 3]);
    });
  });
});
