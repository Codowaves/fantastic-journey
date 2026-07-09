import { describe, expect, it } from "vitest";

import { uniqueBy } from "./unique-by";

describe("uniqueBy", () => {
  it("removes duplicates by key, keeping the first occurrence", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
    ];
    const result = uniqueBy(items, (item) => item.id);
    expect(result).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(uniqueBy<number, number>([], (n) => n)).toEqual([]);
  });

  it("handles key collisions across all items", () => {
    const items = [1, 2, 1, 2, 3, 1];
    const result = uniqueBy(items, (n) => n % 2);
    expect(result).toEqual([1, 2]);
  });

  it("preserves order of first occurrence for each distinct key", () => {
    const items = [
      { k: "b", v: 1 },
      { k: "a", v: 2 },
      { k: "b", v: 3 },
      { k: "c", v: 4 },
      { k: "a", v: 5 },
    ];
    const result = uniqueBy(items, (item) => item.k);
    expect(result.map((item) => item.v)).toEqual([1, 2, 4]);
  });

  it("returns all items when there are no duplicates", () => {
    const items = [1, 2, 3, 4, 5];
    expect(uniqueBy(items, (n) => n)).toEqual([1, 2, 3, 4, 5]);
  });

  it("supports string keys", () => {
    const items = [{ name: "alice" }, { name: "bob" }, { name: "alice" }];
    const result = uniqueBy(items, (item) => item.name);
    expect(result).toEqual([{ name: "alice" }, { name: "bob" }]);
  });

  it("throws TypeError when arr is null or undefined", () => {
    expect(() => uniqueBy(null as unknown as never[], (n: never) => n)).toThrow(
      TypeError,
    );
    expect(() =>
      uniqueBy(undefined as unknown as never[], (n: never) => n),
    ).toThrow(TypeError);
  });

  it("throws TypeError when keyFn is null or undefined", () => {
    expect(() =>
      uniqueBy([1, 2, 3], null as unknown as (n: number) => number),
    ).toThrow(TypeError);
    expect(() =>
      uniqueBy([1, 2, 3], undefined as unknown as (n: number) => number),
    ).toThrow(TypeError);
  });
});
