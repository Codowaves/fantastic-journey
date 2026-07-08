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
    const input = [{ id: 42 }];
    expect(sortByKey(input, "id")).toEqual([{ id: 42 }]);
  });

  it("sorts negative numbers correctly", () => {
    const input = [{ id: 1 }, { id: -5 }, { id: 0 }, { id: -1 }, { id: 3 }];
    expect(sortByKey(input, "id").map((x) => x.id)).toEqual([-5, -1, 0, 1, 3]);
  });

  it("sorts numbers that include zero without dropping them", () => {
    const input = [{ id: 5 }, { id: 0 }, { id: 10 }, { id: 0 }];
    expect(sortByKey(input, "id").map((x) => x.id)).toEqual([0, 0, 5, 10]);
  });

  it("sorts mixed-case strings using localeCompare ordering", () => {
    const input = [{ name: "banana" }, { name: "Apple" }, { name: "cherry" }];
    expect(sortByKey(input, "name").map((x) => x.name)).toEqual([
      "Apple",
      "banana",
      "cherry",
    ]);
  });

  it("falls back to a string comparison when key values are mixed types", () => {
    type Mixed = { id: number | string };
    const input: Mixed[] = [{ id: 10 }, { id: "2" }, { id: "1" }];
    const sorted = sortByKey(input, "id");
    // The comparator is typeof-driven: when either side is not a number,
    // both values are coerced to strings and ordered via localeCompare.
    // That means the number 10 is stringified as "10" and the whole
    // comparison becomes lexicographic on the string forms.
    expect(sorted.map((x) => String(x.id))).toEqual(["1", "10", "2"]);
  });

  it("sorts objects whose key values are non-ASCII characters", () => {
    const input = [{ name: "oso" }, { name: "águila" }, { name: "ñandú" }];
    const sorted = sortByKey(input, "name").map((x) => x.name);
    // Per the host's default locale, the accented "á" must come first
    // and the resulting array must contain all the input items.
    expect(sorted).toHaveLength(input.length);
    expect(sorted[0]).toBe("águila");
    expect(new Set(sorted)).toEqual(new Set(input.map((x) => x.name)));
  });
});
