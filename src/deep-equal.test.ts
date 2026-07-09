import { describe, it, expect } from "vitest";
import { deepEqual } from "./deep-equal";

describe("deepEqual", () => {
  describe("primitives", () => {
    it("returns true for identical primitives", () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual("hello", "hello")).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
    });

    it("returns false for different primitives", () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual("hello", "world")).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
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

  describe("input validation", () => {
    it("throws TypeError when a is null", () => {
      expect(() => deepEqual(null as unknown as object, {})).toThrow(TypeError);
    });

    it("throws TypeError when b is null", () => {
      expect(() => deepEqual({}, null as unknown as object)).toThrow(TypeError);
    });

    it("throws TypeError when a is undefined", () => {
      expect(() => deepEqual(undefined as unknown as object, {})).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when b is undefined", () => {
      expect(() => deepEqual({}, undefined as unknown as object)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when a is NaN", () => {
      expect(() => deepEqual(Number.NaN as unknown as object, {})).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when b is NaN", () => {
      expect(() =>
        deepEqual({} as object, Number.NaN as unknown as object),
      ).toThrow(TypeError);
    });
  });
});
