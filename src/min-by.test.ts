import { describe, expect, it } from "vitest";

import { minBy } from "./min-by";

describe("minBy", () => {
  it("returns the item with the smallest fn value", () => {
    const items = [
      { name: "a", n: 3 },
      { name: "b", n: 1 },
      { name: "c", n: 2 },
    ];
    expect(minBy(items, (item) => item.n)).toEqual({ name: "b", n: 1 });
  });

  it("returns the first item when there is a tie on fn value", () => {
    const items = [
      { name: "a", n: 2 },
      { name: "b", n: 2 },
      { name: "c", n: 3 },
    ];
    expect(minBy(items, (item) => item.n)).toEqual({ name: "a", n: 2 });
  });

  it("returns the only element of a single-item array", () => {
    expect(minBy([42], (n) => n)).toBe(42);
  });

  it("returns undefined for an empty array", () => {
    expect(minBy<number>([], (n) => n)).toBeUndefined();
  });

  it("throws TypeError when arr is null or undefined", () => {
    expect(() => minBy(null as unknown as number[], (n: number) => n)).toThrow(
      TypeError,
    );
    expect(() =>
      minBy(undefined as unknown as number[], (n: number) => n),
    ).toThrow(TypeError);
  });

  it("throws TypeError when fn is null or undefined", () => {
    expect(() =>
      minBy([1, 2, 3], null as unknown as (n: number) => number),
    ).toThrow(TypeError);
    expect(() =>
      minBy([1, 2, 3], undefined as unknown as (n: number) => number),
    ).toThrow(TypeError);
  });

  it("throws TypeError when fn is NaN", () => {
    expect(() =>
      minBy([1, 2, 3], Number.NaN as unknown as (n: number) => number),
    ).toThrow(TypeError);
  });
});
