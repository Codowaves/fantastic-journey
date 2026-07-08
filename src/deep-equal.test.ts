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
    it("handles undefined values inside arrays", () => {
      const a = [1, undefined, 3];
      const b = [1, undefined, 3];
      const c = [1, null, 3];
      const d = [1, undefined, 4];
      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
      expect(deepEqual(a, d)).toBe(false);
      expect(deepEqual([undefined], [undefined])).toBe(true);
    });

    it("returns false for two Invalid Date instances (NaN timestamp)", () => {
      expect(deepEqual(new Date("not-a-date"), new Date("not-a-date"))).toBe(
        false,
      );
    });

    it("returns false when comparing object to string-keyed vs numeric-keyed array-like", () => {
      expect(deepEqual({ 0: "a", 1: "b" }, { 0: "a", 1: "b" })).toBe(true);
      expect(deepEqual({ 0: "a", 1: "b" }, ["a", "b"])).toBe(false);
    });

    it("returns true for objects with numeric string keys", () => {
      expect(deepEqual({ "1": 1, "2": 2 }, { "1": 1, "2": 2 })).toBe(true);
      expect(deepEqual({ "1": 1, "2": 2 }, { "1": 1, "2": 3 })).toBe(false);
    });

    it("handles objects whose values are bigints", () => {
      expect(deepEqual({ n: 1n }, { n: 1n })).toBe(true);
      expect(deepEqual({ n: 1n }, { n: 2n })).toBe(false);
      expect(deepEqual(1n, 1)).toBe(false);
    });

    it("handles boolean true vs false in nested positions", () => {
      expect(deepEqual({ a: true, b: 1 }, { a: true, b: 1 })).toBe(true);
      expect(deepEqual({ a: true, b: 1 }, { a: true, b: "1" })).toBe(false);
      expect(deepEqual({ a: true }, { a: 1 })).toBe(false);
    });

    it("handles deeply nested empty structures", () => {
      expect(deepEqual([[[[]]]], [[[[]]]])).toBe(true);
      expect(deepEqual({ a: { b: { c: {} } } }, { a: { b: { c: {} } } })).toBe(
        true,
      );
    });

    it("returns false when same-length object sets differ", () => {
      expect(deepEqual({ x: 1 }, { y: 1 })).toBe(false);
      expect(deepEqual({ y: 1 }, { x: 1 })).toBe(false);
    });

    it("distinguishes Date from object literal with getTime method", () => {
      const date = new Date("2024-01-01");
      const fake = { getTime: () => date.getTime() } as unknown as Date;
      expect(deepEqual(date, fake)).toBe(false);
    });

    it("returns false for null vs object with null prototype", () => {
      const bare = Object.create(null);
      expect(deepEqual(null, bare)).toBe(false);
      expect(deepEqual(bare, null)).toBe(false);
    });

    it("returns true for matching objects with null prototype", () => {
      const a = Object.create(null);
      a.x = 1;
      a.y = 2;
      const b = Object.create(null);
      b.x = 1;
      b.y = 2;
      expect(deepEqual(a, b)).toBe(true);
    });

    it("compares class instances by own enumerable properties only", () => {
      class A {
        constructor(public x: number) {}
      }
      class B {
        constructor(public x: number) {}
      }
      expect(deepEqual(new A(1), new B(1))).toBe(true);
      expect(deepEqual(new A(1), new A(2))).toBe(false);
      expect(deepEqual(new A(1), { x: 1 })).toBe(true);
    });
  });
});
