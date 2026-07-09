import { describe, expect, it } from "vitest";

import { countBy } from "./count-by";

describe("countBy", () => {
  it("counts items grouped by a string key", () => {
    const items = [
      { type: "fruit", name: "apple" },
      { type: "veg", name: "carrot" },
      { type: "fruit", name: "banana" },
      { type: "fruit", name: "pear" },
    ];
    expect(countBy(items, (i) => i.type)).toEqual({
      fruit: 3,
      veg: 1,
    });
  });

  it("counts items grouped by a numeric key", () => {
    expect(countBy([1, 2, 3, 4, 5, 6, 7], (n) => n % 3)).toEqual({
      0: 2,
      1: 3,
      2: 2,
    });
  });

  it("returns an empty object for an empty input", () => {
    expect(countBy([], (n: number) => n)).toEqual({});
  });

  it("reports a count of 0 for a key that never appears", () => {
    expect(countBy(["a", "b"], () => "missing")).toEqual({ missing: 2 });
  });

  it("handles a single-element input", () => {
    expect(countBy([42], (n) => n)).toEqual({ 42: 1 });
  });

  describe("error/throw paths", () => {
    it("propagates an error thrown by keyFn", () => {
      const boom = () => {
        throw new Error("keyFn exploded");
      };
      expect(() => countBy([1, 2, 3], boom)).toThrow("keyFn exploded");
    });

    it("propagates a TypeError thrown by keyFn", () => {
      const bad = ((_x: number) => {
        throw new TypeError("nope");
      }) as (x: number) => number;
      expect(() => countBy([1, 2, 3], bad)).toThrow(TypeError);
    });

    it("throws TypeError when items is null", () => {
      expect(() =>
        countBy(null as unknown as readonly number[], (n: number) => n),
      ).toThrow(TypeError);
    });

    it("throws TypeError when items is undefined", () => {
      expect(() =>
        countBy(undefined as unknown as readonly number[], (n: number) => n),
      ).toThrow(TypeError);
    });

    it("throws TypeError when keyFn is null", () => {
      expect(() =>
        countBy([1, 2, 3], null as unknown as (n: number) => number),
      ).toThrow(TypeError);
    });

    it("throws TypeError when keyFn is undefined", () => {
      expect(() =>
        countBy([1, 2, 3], undefined as unknown as (n: number) => number),
      ).toThrow(TypeError);
    });

    it("does not throw on a normal, well-formed input", () => {
      expect(() =>
        countBy(
          [{ type: "a" }, { type: "b" }, { type: "a" }],
          (x: { type: string }) => x.type,
        ),
      ).not.toThrow();
    });
  });
});
