import { describe, expect, it } from "vitest";

import { defaultTo } from "./default-to";

describe("defaultTo", () => {
  it("returns the value when it is defined and not NaN", () => {
    expect(defaultTo(1, 10)).toBe(1);
    expect(defaultTo("hello", "fallback")).toBe("hello");
  });

  describe("fallback branch (nullish / NaN)", () => {
    it("returns the fallback for null", () => {
      expect(defaultTo(null, "fallback")).toBe("fallback");
    });

    it("returns the fallback for undefined", () => {
      expect(defaultTo(undefined, 99)).toBe(99);
    });

    it("returns the fallback for NaN", () => {
      // When v is NaN the fallback (0) is returned, not NaN itself.
      expect(defaultTo(NaN, 0)).toBe(0);
      expect(Number.isNaN(defaultTo(NaN, 0))).toBe(false);
    });

    it("returns the fallback when v and d are both nullish", () => {
      expect(defaultTo<null>(null, null)).toBeNull();
      expect(defaultTo<undefined>(undefined, undefined)).toBeUndefined();
    });

    it("returns the fallback when v is NaN and d is also NaN", () => {
      // NaN is never equal to itself, so toBe fails; assert via isNaN.
      expect(Number.isNaN(defaultTo(NaN, NaN))).toBe(true);
    });

    it("returns the fallback string when v is nullish string", () => {
      expect(defaultTo<string | null>(null, "fallback")).toBe("fallback");
      expect(defaultTo<string | undefined>(undefined, "fallback")).toBe(
        "fallback",
      );
    });

    it("returns the fallback number when v is nullish number", () => {
      expect(defaultTo<number | null>(null, -1)).toBe(-1);
      expect(defaultTo<number | undefined>(undefined, -1)).toBe(-1);
    });
  });

  describe("non-nullish falsy values (must not hit the fallback branch)", () => {
    it("returns 0 (a falsy non-nullish number)", () => {
      expect(defaultTo(0, 42)).toBe(0);
    });

    it("returns false (a falsy non-nullish boolean)", () => {
      expect(defaultTo(false, true)).toBe(false);
    });

    it("returns the empty string (a falsy non-nullish string)", () => {
      expect(defaultTo("", "fallback")).toBe("");
    });

    it("returns Infinity as-is (defined, non-NaN number)", () => {
      expect(defaultTo(Infinity, 0)).toBe(Infinity);
      expect(defaultTo(-Infinity, 0)).toBe(-Infinity);
    });
  });

  describe("reference types", () => {
    it("preserves object identity for a non-nullish object", () => {
      const obj = { a: 1 };
      const fallback = { a: 2 };
      expect(defaultTo(obj, fallback)).toBe(obj);
    });

    it("preserves array identity for a non-nullish array", () => {
      const arr = [1, 2];
      expect(defaultTo(arr, [])).toBe(arr);
    });
  });

  describe("error / throw paths", () => {
    it("does not throw when v is null", () => {
      expect(() => defaultTo(null, "fallback")).not.toThrow();
    });

    it("does not throw when v is undefined", () => {
      expect(() => defaultTo(undefined, 99)).not.toThrow();
    });

    it("does not throw when v is NaN", () => {
      expect(() => defaultTo(NaN, 0)).not.toThrow();
    });

    it("does not throw when v and d are both nullish", () => {
      expect(() => defaultTo<null>(null, null)).not.toThrow();
      expect(() => defaultTo<undefined>(undefined, undefined)).not.toThrow();
    });

    it("does not throw on a normal defined value", () => {
      expect(() => defaultTo(1, 10)).not.toThrow();
      expect(() => defaultTo("x", "fallback")).not.toThrow();
    });

    it("does not throw on a frozen fallback object", () => {
      const frozen = Object.freeze({ a: 1 });
      expect(() => defaultTo(null, frozen)).not.toThrow();
      expect(defaultTo(null, frozen)).toBe(frozen);
    });

    it("does not throw when v is NaN from arithmetic (Number('x'))", () => {
      expect(() => defaultTo(Number("x"), 0)).not.toThrow();
      // The NaN value is replaced by the fallback, so the result is 0.
      expect(defaultTo(Number("x"), 0)).toBe(0);
    });
  });
});
