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
});
