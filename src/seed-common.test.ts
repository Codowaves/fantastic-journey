import { describe, it, expect } from "vitest";

import { commonItems } from "./seed-common";

describe("commonItems", () => {
  it("intersect", () => {
    expect(commonItems([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  describe("error/throw paths", () => {
    it("does not throw when both arrays are empty", () => {
      expect(() => commonItems([], [])).not.toThrow();
      expect(commonItems([], [])).toEqual([]);
    });

    it("does not throw when only the first array is empty", () => {
      expect(() => commonItems([], [1, 2, 3])).not.toThrow();
      expect(commonItems([], [1, 2, 3])).toEqual([]);
    });

    it("does not throw when only the second array is empty", () => {
      expect(() => commonItems([1, 2, 3], [])).not.toThrow();
      expect(commonItems([1, 2, 3], [])).toEqual([]);
    });

    it("does not throw when there is no overlap", () => {
      expect(() => commonItems([1, 2, 3], [4, 5, 6])).not.toThrow();
      expect(commonItems([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it("does not throw on a frozen input array", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      expect(() => commonItems(frozen, [2, 3])).not.toThrow();
      expect(commonItems(frozen, [2, 3])).toEqual([2, 3]);
    });

    it("does not throw when both inputs are frozen", () => {
      const a = Object.freeze([1, 2, 3]) as number[];
      const b = Object.freeze([2, 3, 4]) as number[];
      expect(() => commonItems(a, b)).not.toThrow();
      expect(commonItems(a, b)).toEqual([2, 3]);
    });

    it("does not throw on a sealed input array", () => {
      const sealed = Object.seal([1, 2, 3]) as number[];
      expect(() => commonItems(sealed, [2, 3])).not.toThrow();
      expect(commonItems(sealed, [2, 3])).toEqual([2, 3]);
    });

    it("does not throw on an array containing null and undefined values", () => {
      expect(() => commonItems([null, undefined, 1], [null, 1])).not.toThrow();
      expect(commonItems([null, undefined, 1], [null, 1])).toEqual([null, 1]);
    });

    it("does not throw on NaN-bearing arrays (Set treats NaN as identical to NaN)", () => {
      expect(() =>
        commonItems([Number.NaN, 1, 2], [Number.NaN, 2]),
      ).not.toThrow();
      expect(commonItems([Number.NaN, 1, 2], [Number.NaN, 2])).toEqual([
        Number.NaN,
        2,
      ]);
    });

    it("does not throw on arrays of objects with reference equality", () => {
      const obj = { id: 1 };
      const a = [obj, { id: 2 }];
      const b = [obj, { id: 3 }];
      expect(() => commonItems(a, b)).not.toThrow();
      expect(commonItems(a, b)).toEqual([obj]);
    });

    it("does not throw when the first array has many duplicates of one shared value", () => {
      expect(() => commonItems([1, 1, 1, 1, 1], [1])).not.toThrow();
      expect(commonItems([1, 1, 1, 1, 1], [1])).toEqual([1]);
    });

    it("does not throw when the second array has many duplicates of one shared value", () => {
      expect(() => commonItems([1], [1, 1, 1, 1, 1])).not.toThrow();
      expect(commonItems([1], [1, 1, 1, 1, 1])).toEqual([1]);
    });

    it("does not throw when one input is a frozen array and the other is mutable", () => {
      const frozen = Object.freeze([1, 2, 3]) as number[];
      const mutable = [2, 3, 4];
      expect(() => commonItems(frozen, mutable)).not.toThrow();
      expect(commonItems(frozen, mutable)).toEqual([2, 3]);
    });
  });
});
