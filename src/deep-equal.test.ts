import { describe, it, expect } from "vitest";
import { deepEqual } from "./deep-equal";

describe("deepEqual", () => {
  describe("primitives", () => {
    it("returns true for identical primitives", () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual("hello", "hello")).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it("returns false for different primitives", () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual("hello", "world")).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it("handles NaN with Object.is semantics", () => {
      expect(deepEqual(NaN, NaN)).toBe(true);
    });

    it("distinguishes +0 and -0 with Object.is semantics", () => {
      expect(deepEqual(0, -0)).toBe(false);
      expect(deepEqual(+0, -0)).toBe(false);
      expect(deepEqual(0, 0)).toBe(true);
      expect(deepEqual(-0, -0)).toBe(true);
    });
  });

  describe("arrays", () => {
    it("returns true for equal arrays", () => {
      expect(deepEqual([], [])).toBe(true);
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(["a", "b"], ["a", "b"])).toBe(true);
    });

    it("returns false for arrays with different lengths", () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1], [])).toBe(false);
    });

    it("returns false for arrays with different elements", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqual(["a", "b"], ["a", "c"])).toBe(false);
    });

    it("returns false for arrays with same elements in different order", () => {
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
      expect(deepEqual(["a", "b", "c"], ["c", "b", "a"])).toBe(false);
    });

    it("handles nested arrays", () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
      expect(deepEqual([[[1]]], [[[1]]])).toBe(true);
    });
  });

  describe("plain objects", () => {
    it("returns true for equal objects", () => {
      expect(deepEqual({}, {})).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it("returns false for objects with different keys", () => {
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it("returns false for objects with different values", () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    it("handles nested objects", () => {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
      expect(deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } })).toBe(
        true,
      );
    });

    it("handles objects with array values", () => {
      expect(deepEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
      expect(deepEqual({ a: [1, 2] }, { a: [1, 3] })).toBe(false);
    });
  });

  describe("Date objects", () => {
    it("returns true for dates with same timestamp", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-01");
      expect(deepEqual(date1, date2)).toBe(true);
    });

    it("returns false for dates with different timestamps", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-02");
      expect(deepEqual(date1, date2)).toBe(false);
    });

    it("returns false when comparing Date to non-Date", () => {
      const date = new Date("2024-01-01");
      expect(deepEqual(date, {})).toBe(false);
      expect(deepEqual(date, [])).toBe(false);
      expect(deepEqual(date, date.getTime())).toBe(false);
    });
  });

  describe("mixed types", () => {
    it("returns false for null vs empty object", () => {
      expect(deepEqual(null, {})).toBe(false);
      expect(deepEqual({}, null)).toBe(false);
    });

    it("returns false for array vs object", () => {
      expect(deepEqual([], {})).toBe(false);
      expect(deepEqual({}, [])).toBe(false);
      expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });

    it("returns false for primitive vs object", () => {
      expect(deepEqual(1, { valueOf: () => 1 })).toBe(false);
      expect(deepEqual("hello", { toString: () => "hello" })).toBe(false);
    });
  });

  describe("complex nested structures", () => {
    it("handles deeply nested mixed structures", () => {
      const obj1 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: [5, 6], f: new Date("2024-01-01") },
      };
      const obj2 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: [5, 6], f: new Date("2024-01-01") },
      };
      const obj3 = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: [5, 6], f: new Date("2024-01-02") },
      };

      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("treats the same reference as equal", () => {
      const obj = { a: 1, b: [2, 3] };
      const arr = [1, 2, 3];
      const date = new Date("2024-01-01");
      expect(deepEqual(obj, obj)).toBe(true);
      expect(deepEqual(arr, arr)).toBe(true);
      expect(deepEqual(date, date)).toBe(true);
    });

    it("returns true for two empty plain objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("returns true for two empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it("distinguishes null from undefined", () => {
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(undefined, null)).toBe(false);
    });

    it("returns true for objects where one value is explicitly undefined", () => {
      expect(deepEqual({ a: undefined }, { a: undefined })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: undefined })).toBe(false);
    });

    it("treats undefined-valued and missing keys as not equal", () => {
      expect(deepEqual({ a: undefined }, {})).toBe(false);
      expect(deepEqual({}, { a: undefined })).toBe(false);
    });

    it("handles objects with null prototype", () => {
      const a = Object.create(null);
      a.x = 1;
      const b = Object.create(null);
      b.x = 1;
      expect(deepEqual(a, b)).toBe(true);

      const c = Object.create(null);
      c.x = 2;
      expect(deepEqual(a, c)).toBe(false);
    });

    it("ignores inherited enumerable properties", () => {
      class Base {
        inherited = 1;
      }
      class Child extends Base {
        own = 2;
      }
      const c1 = new Child();
      const c2 = new Child();
      expect(deepEqual(c1, c2)).toBe(true);

      const different = new Child();
      different.inherited = 99;
      expect(deepEqual(c1, different)).toBe(false);
    });

    it("treats sparse arrays with the same holes as equal", () => {
      // eslint-disable-next-line no-sparse-arrays
      const sparse = [1, , 3];
      // eslint-disable-next-line no-sparse-arrays
      const sparseCopy = [1, , 3];
      expect(deepEqual(sparse, sparseCopy)).toBe(true);
    });

    it("returns false when comparing functions to each other", () => {
      expect(
        deepEqual(
          () => 1,
          () => 1,
        ),
      ).toBe(false);
    });

    it("returns false when comparing a function to a non-function object", () => {
      const fn = () => 1;
      expect(deepEqual(fn, {})).toBe(false);
      expect(deepEqual({}, fn)).toBe(false);
    });

    it("returns false for arrays vs objects with the same numeric keys", () => {
      expect(deepEqual([1, 2], { 0: 1, 1: 2, length: 2 })).toBe(false);
    });

    it("treats BigInt values with Object.is semantics", () => {
      expect(deepEqual(1n, 1n)).toBe(true);
      expect(deepEqual(1n, 2n)).toBe(false);
      expect(deepEqual(1n, 1)).toBe(false);
    });

    it("distinguishes numeric strings from numbers", () => {
      expect(deepEqual("1", 1)).toBe(false);
      expect(deepEqual(1, "1")).toBe(false);
    });

    it("handles empty string vs missing string", () => {
      expect(deepEqual({ a: "" }, { a: "" })).toBe(true);
      expect(deepEqual({ a: "" }, {})).toBe(false);
    });

    it("treats invalid Date instances as not equal to valid Dates", () => {
      const invalid = new Date("not-a-date");
      const valid = new Date("2024-01-01");
      expect(Number.isNaN(invalid.getTime())).toBe(true);
      expect(deepEqual(invalid, valid)).toBe(false);
      expect(deepEqual(invalid, invalid)).toBe(true);
    });
  });
});
