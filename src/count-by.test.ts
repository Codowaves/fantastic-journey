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

  it("propagates errors thrown by keyFn", () => {
    const items = [{ type: "fruit" }, { type: "veg" }, { type: "bad" }];
    expect(() =>
      countBy(items, (i) => {
        if (i.type === "bad") {
          throw new Error("bad item");
        }
        return i.type;
      }),
    ).toThrow("bad item");
  });

  it("propagates the first throw from keyFn and stops iteration", () => {
    let calls = 0;
    expect(() =>
      countBy([1, 2, 3, 4], (n) => {
        calls++;
        if (n === 2) {
          throw new RangeError("boom");
        }
        return n;
      }),
    ).toThrow(RangeError);
    expect(calls).toBe(2);
  });

  it("does not throw when keyFn returns a non-finite numeric key", () => {
    const items = [0, 1, 2, NaN as unknown as number];
    const result = countBy(items, (n) => n);
    expect(result[NaN]).toBe(1);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(1);
  });

  it("lets keyFn decide what to do with null/undefined items", () => {
    const items: Array<unknown> = [1, null, undefined, 2, 1];
    expect(() =>
      countBy(items, (item) => {
        if (item == null) {
          throw new TypeError("item is nullish");
        }
        return typeof item;
      }),
    ).toThrow(TypeError);
  });
});
