import { describe, expect, it } from "vitest";

import { sortByKey } from "./sort-by-key";

describe("sortByKey", () => {
  it("sorts objects ascending by a numeric key", () => {
    const input = [
      { id: 3, name: "c" },
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ];
    expect(sortByKey(input, "id")).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ]);
  });

  it("sorts objects ascending by a string key", () => {
    const input = [
      { name: "charlie", age: 30 },
      { name: "alpha", age: 40 },
      { name: "bravo", age: 20 },
    ];
    expect(sortByKey(input, "name")).toEqual([
      { name: "alpha", age: 40 },
      { name: "bravo", age: 20 },
      { name: "charlie", age: 30 },
    ]);
  });

  it("does not mutate the input array", () => {
    const input = [{ id: 2 }, { id: 1 }];
    const original = [...input];
    sortByKey(input, "id");
    expect(input).toEqual(original);
  });

  it("returns an empty array when given an empty array", () => {
    expect(sortByKey<{ id: number }, "id">([], "id")).toEqual([]);
  });

  it("preserves stable order for elements with equal keys", () => {
    const input = [
      { id: 1, tag: "first" },
      { id: 2, tag: "a" },
      { id: 1, tag: "second" },
      { id: 2, tag: "b" },
      { id: 1, tag: "third" },
    ];
    const sorted = sortByKey(input, "id");
    expect(sorted.map((x) => x.tag)).toEqual([
      "first",
      "second",
      "third",
      "a",
      "b",
    ]);
  });
});
