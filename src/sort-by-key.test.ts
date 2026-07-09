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

  describe("edge cases", () => {
    it("handles a single-element array", () => {
      expect(sortByKey([{ id: 42, name: "only" }], "id")).toEqual([
        { id: 42, name: "only" },
      ]);
    });

    it("handles negative numbers", () => {
      const input = [{ v: 3 }, { v: -1 }, { v: 0 }, { v: -10 }, { v: 5 }];
      expect(sortByKey(input, "v").map((x) => x.v)).toEqual([-10, -1, 0, 3, 5]);
    });

    it("handles duplicate numeric keys (stable order)", () => {
      const input = [
        { id: 2, tag: "a" },
        { id: 1, tag: "b" },
        { id: 2, tag: "c" },
        { id: 1, tag: "d" },
      ];
      const sorted = sortByKey(input, "id");
      expect(sorted.map((x) => x.tag)).toEqual(["b", "d", "a", "c"]);
    });

    it("handles duplicate string keys (stable order)", () => {
      const input = [
        { name: "b", tag: 1 },
        { name: "a", tag: 2 },
        { name: "b", tag: 3 },
        { name: "a", tag: 4 },
      ];
      const sorted = sortByKey(input, "name");
      expect(sorted.map((x) => x.tag)).toEqual([2, 4, 1, 3]);
    });

    it("sorts an already-sorted array without changing order", () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(sortByKey(input, "id")).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it("sorts a reverse-sorted array", () => {
      const input = [{ id: 3 }, { id: 2 }, { id: 1 }];
      expect(sortByKey(input, "id")).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it("handles zero as a numeric key value", () => {
      const input = [{ v: 2 }, { v: 0 }, { v: 1 }];
      expect(sortByKey(input, "v").map((x) => x.v)).toEqual([0, 1, 2]);
    });

    it("handles empty string as a string key value", () => {
      const input = [{ s: "b" }, { s: "" }, { s: "a" }];
      // localeCompare: "" sorts before letters
      expect(sortByKey(input, "s").map((x) => x.s)).toEqual(["", "a", "b"]);
    });

    it("handles unicode strings via locale ordering", () => {
      const input = [{ s: "z" }, { s: "ä" }, { s: "a" }];
      // localeCompare in default locale puts ä near a (after a).
      expect(sortByKey(input, "s").map((x) => x.s)).toEqual(["a", "ä", "z"]);
    });

    it("sorts a large array correctly", () => {
      const n = 100;
      const input = Array.from({ length: n }, (_, i) => ({
        id: (n - i) % n,
      }));
      const sorted = sortByKey(input, "id");
      expect(sorted.map((x) => x.id)).toEqual(
        Array.from({ length: n }, (_, i) => i),
      );
    });

    it("returns a new array reference (not the input)", () => {
      const input = [{ id: 2 }, { id: 1 }];
      const result = sortByKey(input, "id");
      expect(result).not.toBe(input);
    });

    it("does not mutate the input array (deep check)", () => {
      const input = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const snapshot = input.map((x) => ({ ...x }));
      sortByKey(input, "id");
      expect(input).toEqual(snapshot);
    });

    it("works with readonly arrays (treated as T[])", () => {
      const input: ReadonlyArray<{ id: number }> = [{ id: 2 }, { id: 1 }];
      const sorted = sortByKey(input as { id: number }[], "id");
      expect(sorted.map((x) => x.id)).toEqual([1, 2]);
    });

    it("works on a typed union of object shapes (sorting by a shared key)", () => {
      type Shape =
        { kind: "circle"; area: number } | { kind: "square"; area: number };
      const input: Shape[] = [
        { kind: "circle", area: 3 },
        { kind: "square", area: 1 },
        { kind: "circle", area: 1 },
      ];
      const byArea = sortByKey(input, "area");
      expect(byArea.map((x) => x.area)).toEqual([1, 1, 3]);
    });

    it("does not throw on empty input", () => {
      expect(() => sortByKey<{ id: number }, "id">([], "id")).not.toThrow();
    });
  });
});
