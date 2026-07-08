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

  describe("error/throw/fallback branches", () => {
    it("returns undefined for an empty array produced by Array(0)", () => {
      expect(minBy(Array(0), (n: number) => n)).toBeUndefined();
    });

    it("returns undefined for an array produced by new Array()", () => {
      expect(minBy(new Array<number>(), (n) => n)).toBeUndefined();
    });

    it("returns undefined when the array is empty even if fn would throw", () => {
      // Empty-array short-circuit must run before any fn call.
      expect(
        minBy<number>([], () => {
          throw new Error("fn must not be called for empty input");
        }),
      ).toBeUndefined();
    });

    it("does not throw on an empty array", () => {
      expect(() => minBy([], (n: number) => n)).not.toThrow();
    });

    it("does not throw on a single-item array", () => {
      expect(() => minBy([7], (n) => n)).not.toThrow();
    });

    it("does not throw on a frozen array", () => {
      const frozen = Object.freeze([3, 1, 2]) as number[];
      expect(() => minBy(frozen, (n) => n)).not.toThrow();
      expect(minBy(frozen, (n) => n)).toBe(1);
    });

    it("propagates a throw from fn", () => {
      const items = [1, 2, 3];
      expect(() =>
        minBy(items, (n) => {
          if (n === 2) throw new Error("boom");
          return n;
        }),
      ).toThrow("boom");
    });

    it("preserves the in-range branch when fn returns Infinity for non-min items", () => {
      // The strict < comparison should still pick the actual min even when
      // other items map to Infinity.
      const items = [{ k: Infinity }, { k: 5 }, { k: 10 }];
      expect(minBy(items, (i) => i.k)).toEqual({ k: 5 });
    });

    it("returns -Infinity when the smallest fn value is -Infinity", () => {
      const items = [{ k: 1 }, { k: -Infinity }, { k: 0 }];
      expect(minBy(items, (i) => i.k)).toEqual({ k: -Infinity });
    });

    it("handles negative keys", () => {
      expect(minBy([-3, -7, -1, -10], (n) => n)).toBe(-10);
    });
  });

  describe("NaN handling", () => {
    it("treats NaN keys as 'not less' and returns the first real minimum", () => {
      const items = [
        { name: "a", n: 1 },
        { name: "b", n: NaN },
        { name: "c", n: 2 },
      ];
      expect(minBy(items, (i) => i.n)).toEqual({ name: "a", n: 1 });
    });

    it("returns the only element when fn returns NaN for a single-item array", () => {
      // No comparisons happen with one element, so NaN does not block selection.
      expect(minBy([7], () => Number.NaN)).toBe(7);
    });

    it("falls back to the first element when every fn value is NaN", () => {
      const items = [{ name: "a" }, { name: "b" }, { name: "c" }];
      expect(minBy(items, () => Number.NaN)).toEqual({ name: "a" });
    });

    it("does not throw when fn returns NaN for some items", () => {
      const items = [1, 2, 3];
      expect(() =>
        minBy(items, (n) => (n === 2 ? Number.NaN : n)),
      ).not.toThrow();
    });
  });

  describe("ties and ordering edge cases", () => {
    it("returns the first element when all items tie on fn value", () => {
      const items = [
        { id: "a", score: 5 },
        { id: "b", score: 5 },
        { id: "c", score: 5 },
      ];
      expect(minBy(items, (i) => i.score)).toEqual({ id: "a", score: 5 });
    });

    it("returns the first minimum when there are multiple tied minimums among non-minimums", () => {
      const items = [
        { id: 1, v: 9 },
        { id: 2, v: 1 },
        { id: 3, v: 1 },
        { id: 4, v: 1 },
      ];
      expect(minBy(items, (i) => i.v)).toEqual({ id: 2, v: 1 });
    });

    it("skips values equal to the running minimum (strict less-than)", () => {
      // Strict < means first occurrence wins; verify the same tie arrives via a
      // later item that equals the minimum — the loop branch must not execute.
      const order: string[] = [];
      const items = [
        { name: "b", n: 1 },
        { name: "a", n: 1 },
      ];
      const result = minBy(items, (i) => {
        order.push(i.name);
        return i.n;
      });
      expect(order).toEqual(["b", "a"]);
      expect(result).toEqual({ name: "b", n: 1 });
    });

    it("handles the smallest value at the end of the array", () => {
      const items = [10, 5, 8, 3, 9];
      expect(minBy(items, (n) => n)).toBe(3);
    });

    it("handles the smallest value at the start of the array", () => {
      const items = [1, 10, 5, 8, 9];
      expect(minBy(items, (n) => n)).toBe(1);
    });
  });
});
