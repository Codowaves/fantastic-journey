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

  it("returns a single-element array unchanged", () => {
    const input = [{ id: 42, name: "only" }];
    expect(sortByKey(input, "id")).toEqual([{ id: 42, name: "only" }]);
  });

  it("sorts negative numbers correctly", () => {
    const input = [{ id: 5 }, { id: -10 }, { id: 0 }, { id: -1 }, { id: 3 }];
    expect(sortByKey(input, "id").map((x) => x.id)).toEqual([-10, -1, 0, 3, 5]);
  });

  it("preserves input order when all keys are equal", () => {
    const input = [
      { id: 7, tag: "a" },
      { id: 7, tag: "b" },
      { id: 7, tag: "c" },
    ];
    expect(sortByKey(input, "id").map((x) => x.tag)).toEqual(["a", "b", "c"]);
  });

  it("sorts elements with null key values without throwing", () => {
    const input = [
      { id: 2 as number | null },
      { id: null },
      { id: 1 as number | null },
      { id: 3 as number | null },
    ];
    const result = sortByKey(input, "id").map((x) => x.id);
    expect(result).toHaveLength(4);
    expect(result.filter((x) => x === null)).toHaveLength(1);
    expect(result.filter((x) => x !== null)).toEqual([1, 2, 3]);
  });

  it("sorts elements with undefined key values without throwing", () => {
    const input: { id: number | undefined }[] = [
      { id: 2 },
      { id: undefined },
      { id: 1 },
      { id: 3 },
    ];
    const result = sortByKey(input, "id").map((x) => x.id);
    expect(result).toHaveLength(4);
    expect(result.filter((x) => x === undefined)).toHaveLength(1);
    expect(result.filter((x) => x !== undefined)).toEqual([1, 2, 3]);
  });

  it("sorts strings lexicographically using localeCompare", () => {
    const input = [{ name: "banana" }, { name: "apple" }, { name: "cherry" }];
    expect(sortByKey(input, "name").map((x) => x.name)).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
  });

  it("handles an already-sorted array", () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(sortByKey(input, "id")).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("handles a reverse-sorted array", () => {
    const input = [{ id: 3 }, { id: 2 }, { id: 1 }];
    expect(sortByKey(input, "id")).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("returns a new array reference even when the input is empty", () => {
    const input: { id: number }[] = [];
    const result = sortByKey(input, "id");
    expect(result).not.toBe(input);
    expect(result).toEqual([]);
  });

  it("sorts keys when one value is 0 (boundary numeric value)", () => {
    const input = [{ id: 1 }, { id: 0 }, { id: -1 }, { id: 2 }];
    expect(sortByKey(input, "id").map((x) => x.id)).toEqual([-1, 0, 1, 2]);
  });
});
