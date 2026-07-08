import { describe, expect, it } from "vitest";

import { isEmptyValue } from "./is-empty-value";

describe("isEmptyValue", () => {
  describe("null/undefined branch", () => {
    it("returns true for null", () => {
      expect(isEmptyValue(null)).toBe(true);
    });

    it("returns true for undefined", () => {
      expect(isEmptyValue(undefined)).toBe(true);
    });

    it("treats void 0 the same as undefined", () => {
      expect(isEmptyValue(void 0)).toBe(true);
    });

    it("does not throw on null or undefined", () => {
      expect(() => isEmptyValue(null)).not.toThrow();
      expect(() => isEmptyValue(undefined)).not.toThrow();
      expect(() => isEmptyValue(void 0)).not.toThrow();
    });
  });

  describe("string branch", () => {
    it("returns true for an empty string", () => {
      expect(isEmptyValue("")).toBe(true);
    });

    it("returns false for a non-empty string", () => {
      expect(isEmptyValue("hello")).toBe(false);
    });

    it("returns false for a whitespace-only string (length > 0)", () => {
      expect(isEmptyValue("   ")).toBe(false);
    });

    it("returns true for an explicitly constructed empty string", () => {
      expect(isEmptyValue(String())).toBe(true);
      expect(isEmptyValue(new String(""))).toBe(true);
    });

    it("does not throw on strings", () => {
      expect(() => isEmptyValue("hello")).not.toThrow();
      expect(() => isEmptyValue("")).not.toThrow();
    });
  });

  describe("array branch", () => {
    it("returns true for an empty array", () => {
      expect(isEmptyValue([])).toBe(true);
    });

    it("returns false for a non-empty array", () => {
      expect(isEmptyValue([1, 2, 3])).toBe(false);
    });

    it("returns false for a sparse array with a single hole (length 1, no own index)", () => {
      // [,].length === 1, so the array branch returns false — locking in current behavior.
      const sparse: unknown[] = [];
      sparse[1] = undefined;
      expect(sparse.length).toBe(2);
      expect(isEmptyValue(sparse)).toBe(false);
    });

    it("returns true for an array with length 0 produced by Array(0)", () => {
      expect(isEmptyValue(Array(0))).toBe(true);
    });

    it("does not throw on arrays", () => {
      expect(() => isEmptyValue([1, 2, 3])).not.toThrow();
    });
  });

  describe("object branch", () => {
    it("returns true for an empty object", () => {
      expect(isEmptyValue({})).toBe(true);
    });

    it("returns false for a non-empty object", () => {
      expect(isEmptyValue({ a: 1 })).toBe(false);
    });

    it("does not invoke getters (Object.keys only enumerates own properties)", () => {
      let getterCalled = false;
      const obj = {};
      Object.defineProperty(obj, "boom", {
        enumerable: true,
        get() {
          getterCalled = true;
          throw new Error("getter should never run");
        },
      });
      expect(isEmptyValue(obj)).toBe(false);
      expect(getterCalled).toBe(false);
    });

    it("returns true for objects with no own enumerable keys regardless of prototype", () => {
      class Foo {}
      expect(isEmptyValue(new Foo())).toBe(true);
      expect(isEmptyValue(Object.create(null))).toBe(true);
    });

    it("ignores inherited properties (own-keys branch returns true for child-only-empty)", () => {
      const proto = { inherited: 1 };
      const child = Object.create(proto);
      expect(isEmptyValue(child)).toBe(true);
    });

    it("returns true for an object with only non-enumerable own keys (Object.keys skips them)", () => {
      const obj = {};
      Object.defineProperty(obj, "hidden", {
        value: 1,
        enumerable: false,
      });
      expect(isEmptyValue(obj)).toBe(true);
    });

    it("returns false for a frozen/sealed object with own keys", () => {
      const sealed = Object.seal({ a: 1 });
      expect(isEmptyValue(sealed)).toBe(false);

      const frozen = Object.freeze({ b: 2 });
      expect(isEmptyValue(frozen)).toBe(false);
    });

    it("returns true for frozen/sealed objects with no own keys", () => {
      const sealed = Object.seal({});
      expect(isEmptyValue(sealed)).toBe(true);

      const frozen = Object.freeze({});
      expect(isEmptyValue(frozen)).toBe(true);
    });

    it("does not throw on common object shapes", () => {
      expect(() => isEmptyValue({})).not.toThrow();
      expect(() => isEmptyValue({ a: 1 })).not.toThrow();
      expect(() => isEmptyValue(Object.create(null))).not.toThrow();
      expect(() => isEmptyValue(new Date())).not.toThrow();
      expect(() => isEmptyValue(/regex/)).not.toThrow();
      expect(() => isEmptyValue(new Error("boom"))).not.toThrow();
    });

    it("returns true for built-in objects with no own enumerable keys", () => {
      expect(isEmptyValue(new Date(0))).toBe(true);
      expect(isEmptyValue(/x/)).toBe(true);
      expect(isEmptyValue(new Map())).toBe(true);
      expect(isEmptyValue(new Set())).toBe(true);
    });

    it("returns false for built-in objects with own enumerable keys (Date instance id is enumerable)", () => {
      // `new Date().id` is not a standard field, but accessing `.toString()` would invoke a getter.
      // We instead construct an object that has at least one own enumerable key.
      const withKey = { kind: "wrapped" };
      expect(isEmptyValue(withKey)).toBe(false);
    });

    it("does not throw on objects whose own keys are getter-throwing when not invoked", () => {
      // Object.defineProperty with a throwing getter still records the key as enumerable.
      // Object.keys does not invoke getters, so this must not throw.
      const obj = {};
      Object.defineProperty(obj, "k", {
        enumerable: true,
        configurable: true,
        get() {
          throw new Error("getter");
        },
      });
      expect(() => isEmptyValue(obj)).not.toThrow();
      expect(isEmptyValue(obj)).toBe(false);
    });
  });

  describe("fallback branch (non-nullish, non-string, non-array, non-object)", () => {
    it("returns false for primitive numbers (the final return-false fallback)", () => {
      expect(isEmptyValue(0)).toBe(false);
      expect(isEmptyValue(42)).toBe(false);
      expect(isEmptyValue(-1)).toBe(false);
    });

    it("returns false for special numeric values via the fallback branch", () => {
      expect(isEmptyValue(NaN)).toBe(false);
      expect(isEmptyValue(Infinity)).toBe(false);
      expect(isEmptyValue(-Infinity)).toBe(false);
      expect(isEmptyValue(Number.MAX_VALUE)).toBe(false);
      expect(isEmptyValue(Number.MIN_VALUE)).toBe(false);
    });

    it("returns false for booleans via the fallback branch", () => {
      expect(isEmptyValue(false)).toBe(false);
      expect(isEmptyValue(true)).toBe(false);
    });

    it("returns false for bigints via the fallback branch", () => {
      expect(isEmptyValue(0n)).toBe(false);
      expect(isEmptyValue(42n)).toBe(false);
    });

    it("returns false for symbols via the fallback branch", () => {
      expect(isEmptyValue(Symbol())).toBe(false);
      expect(isEmptyValue(Symbol("x"))).toBe(false);
    });

    it("returns false for functions via the fallback branch", () => {
      expect(isEmptyValue(() => undefined)).toBe(false);
      expect(isEmptyValue(function named() {})).toBe(false);
    });

    it("does not throw on any fallback-branch input", () => {
      expect(() => isEmptyValue(0)).not.toThrow();
      expect(() => isEmptyValue(NaN)).not.toThrow();
      expect(() => isEmptyValue(Infinity)).not.toThrow();
      expect(() => isEmptyValue(Symbol())).not.toThrow();
      expect(() => isEmptyValue(123n)).not.toThrow();
      expect(() => isEmptyValue(true)).not.toThrow();
      expect(() => isEmptyValue(() => undefined)).not.toThrow();
    });
  });

  describe("error / throw paths", () => {
    it("does not throw on a deeply nested empty container", () => {
      expect(() => isEmptyValue({ a: { b: { c: {} } } })).not.toThrow();
      expect(isEmptyValue({ a: { b: { c: {} } } })).toBe(false);
    });

    it("does not throw on a proxy that intercepts get on the empty path", () => {
      const proxy = new Proxy(
        {},
        {
          get() {
            return new Proxy({}, this);
          },
        },
      );
      expect(() => isEmptyValue(proxy)).not.toThrow();
      expect(isEmptyValue(proxy)).toBe(true);
    });

    it("does not throw on objects whose [[Prototype]] is null and have own keys", () => {
      const obj = Object.create(null);
      obj.a = 1;
      expect(() => isEmptyValue(obj)).not.toThrow();
      expect(isEmptyValue(obj)).toBe(false);
    });

    it("does not throw on the result of Object.preventExtensions on an empty object", () => {
      const obj = Object.preventExtensions({});
      expect(() => isEmptyValue(obj)).not.toThrow();
      expect(isEmptyValue(obj)).toBe(true);
    });

    it("does not throw on the result of Object.preventExtensions on a non-empty object", () => {
      const obj = Object.preventExtensions({ a: 1 });
      expect(() => isEmptyValue(obj)).not.toThrow();
      expect(isEmptyValue(obj)).toBe(false);
    });
  });
});
