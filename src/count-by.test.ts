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

  it("propagates an error thrown by keyFn on the first item", () => {
    const boom = () => {
      throw new Error("boom");
    };
    expect(() => countBy([1], boom)).toThrow("boom");
  });

  it("propagates an error thrown by keyFn on a later item", () => {
    const items = [1, 2, 3];
    const boom = (n: number) => {
      if (n === 2) {
        throw new Error("bad key");
      }
      return n;
    };
    expect(() => countBy(items, boom)).toThrow("bad key");
  });

  it("propagates a non-Error throw value from keyFn", () => {
    const fn = (n: number) => {
      if (n === 1) {
        throw "string-throw";
      }
      return n;
    };
    expect(() => countBy([1], fn)).toThrow("string-throw");
  });

  it("does not mutate the input array when keyFn throws partway", () => {
    const items = [1, 2, 3];
    const snapshot = [...items];
    const boom = (n: number) => {
      if (n === 2) {
        throw new Error("nope");
      }
      return n;
    };
    expect(() => countBy(items, boom)).toThrow("nope");
    expect(items).toEqual(snapshot);
  });
});
