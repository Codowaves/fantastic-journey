import { describe, expect, it } from "vitest";

import { uniqBy } from "./uniq-by";

describe("uniqBy", () => {
  it("removes duplicates by key, keeping the first occurrence", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
    ];
    const result = uniqBy(items, (item) => item.id);
    expect(result).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(uniqBy<number>([], (n) => n)).toEqual([]);
  });

  it("handles the example from the spec", () => {
    const items = [{ id: 1 }, { id: 1 }, { id: 2 }];
    const result = uniqBy(items, (x) => x.id);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("preserves order of first occurrence for each distinct key", () => {
    const items = [
      { k: "b", v: 1 },
      { k: "a", v: 2 },
      { k: "b", v: 3 },
      { k: "c", v: 4 },
      { k: "a", v: 5 },
    ];
    const result = uniqBy(items, (item) => item.k);
    expect(result.map((item) => item.v)).toEqual([1, 2, 4]);
  });

  it("returns all items when there are no duplicates", () => {
    const items = [1, 2, 3, 4, 5];
    expect(uniqBy(items, (n) => n)).toEqual([1, 2, 3, 4, 5]);
  });

  it("supports string keys", () => {
    const items = [{ name: "alice" }, { name: "bob" }, { name: "alice" }];
    const result = uniqBy(items, (item) => item.name);
    expect(result).toEqual([{ name: "alice" }, { name: "bob" }]);
  });

  it("does not mutate the input array", () => {
    const items = [{ id: 1 }, { id: 1 }, { id: 2 }];
    const original = [...items];
    uniqBy(items, (x) => x.id);
    expect(items).toEqual(original);
  });
});
