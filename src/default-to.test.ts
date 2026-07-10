import { describe, expect, it } from "vitest";

import { defaultTo } from "./default-to";

describe("defaultTo", () => {
  it("returns the value when it is defined and not NaN", () => {
    expect(defaultTo(1, 10)).toBe(1);
    expect(defaultTo("hello", "fallback")).toBe("hello");
  });

  it("returns the fallback for null", () => {
    expect(defaultTo(null, "fallback")).toBe("fallback");
  });

  it("returns the fallback for undefined", () => {
    expect(defaultTo(undefined, 99)).toBe(99);
  });

  it("returns the fallback for NaN", () => {
    expect(defaultTo(NaN, 0)).toBe(0);
  });

  it("returns the value when it is 0 (a falsy non-nullish number)", () => {
    expect(defaultTo(0, 42)).toBe(0);
  });

  it("returns the value when it is false (a falsy non-nullish boolean)", () => {
    expect(defaultTo(false, true)).toBe(false);
  });

  it("returns the value when it is the empty string (a falsy non-nullish string)", () => {
    expect(defaultTo("", "fallback")).toBe("");
  });

  it("returns the fallback when v and d are both nullish", () => {
    expect(defaultTo<null>(null, null)).toBeNull();
    expect(defaultTo<undefined>(undefined, undefined)).toBeUndefined();
  });

  it("returns the fallback when v is the same as d", () => {
    expect(defaultTo(NaN, NaN)).toBeNaN();
    expect(defaultTo(null, null)).toBeNull();
  });

  it("returns the value for non-falsy reference types", () => {
    const obj = { a: 1 };
    const arr = [1, 2];
    const fallback = { a: 2 };
    expect(defaultTo(obj, fallback)).toBe(obj);
    expect(defaultTo(arr, [])).toBe(arr);
  });

  it("returns the fallback for Infinity-via-NaN path", () => {
    // Infinity is a defined, non-NaN number, so it should be returned as-is.
    expect(defaultTo(Infinity, 0)).toBe(Infinity);
    expect(defaultTo(-Infinity, 0)).toBe(-Infinity);
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

  describe("error/throw paths", () => {
    it("does not invoke a throwing getter when v is a bare accessor object", () => {
      let getterCalled = false;
      const v = {};
      Object.defineProperty(v, "value", {
        enumerable: true,
        get() {
          getterCalled = true;
          throw new Error("getter should never run");
        },
      });
      // V is a non-null object reference, so defaultTo must short-circuit on
      // the v === null / v === undefined checks and return v without reading
      // any of its properties.
      const result = defaultTo(v, { fallback: true });
      expect(getterCalled).toBe(false);
      expect(result).toBe(v);
    });

    it("does not throw when the fallback is a bare accessor object", () => {
      let getterCalled = false;
      const d = {};
      Object.defineProperty(d, "value", {
        enumerable: true,
        get() {
          getterCalled = true;
          throw new Error("getter should never run");
        },
      });
      // v is nullish, so the fallback d must be returned without reading any
      // of its properties — even if reading would throw.
      const result = defaultTo(null, d);
      expect(getterCalled).toBe(false);
      expect(result).toBe(d);
    });

    it("does not throw when both v and d are throwing-accessor objects and v is non-nullish", () => {
      const make = () => {
        const o = {};
        Object.defineProperty(o, "value", {
          enumerable: true,
          get() {
            throw new Error("boom");
          },
        });
        return o;
      };
      const v = make();
      const d = make();
      expect(() => defaultTo(v, d)).not.toThrow();
      expect(defaultTo(v, d)).toBe(v);
    });

    it("does not throw on a frozen value", () => {
      const v: { a: number } = Object.freeze({ a: 1 });
      const d: { a: number } = Object.freeze({ a: 2 });
      expect(() => defaultTo(v, d)).not.toThrow();
      expect(defaultTo(v, d)).toBe(v);
    });

    it("does not throw on a sealed value", () => {
      const v: { a: number } = Object.seal({ a: 1 });
      const d: { a: number } = Object.seal({ a: 2 });
      expect(() => defaultTo(v, d)).not.toThrow();
      expect(defaultTo(v, d)).toBe(v);
    });

    it("does not throw when v is nullish and the fallback is frozen", () => {
      const d = Object.freeze([1, 2, 3]);
      expect(() => defaultTo(null, d)).not.toThrow();
      expect(() => defaultTo(undefined, d)).not.toThrow();
      expect(defaultTo(null, d)).toBe(d);
    });

    it("does not throw when v is nullish and the fallback is a Proxy", () => {
      const d = new Proxy({ a: 1 }, {});
      expect(() => defaultTo(undefined, d)).not.toThrow();
      expect(defaultTo(undefined, d)).toBe(d);
    });

    it("does not throw on NaN fallback that aliases Number.NaN", () => {
      // Number.NaN, globalThis.NaN, and any NaN produced by 0/0 are all
      // indistinguishable by value, but the fallback branch still returns the
      // expression as written.
      expect(() => defaultTo(NaN, Number.NaN)).not.toThrow();
      expect(() => defaultTo(NaN, 0 / 0)).not.toThrow();
      expect(Number.isNaN(defaultTo(NaN, 0 / 0))).toBe(true);
    });

    it("does not throw on BigInt values (BigInt is non-nullish, non-number)", () => {
      // typeof 1n === "bigint", so the NaN branch never fires; the function
      // returns v unchanged. BigInts are well-defined value types and must
      // not surprise the caller.
      expect(() => defaultTo(1n, 0n)).not.toThrow();
      expect(defaultTo(1n, 99n)).toBe(1n);
    });

    it("does not throw on symbol values (symbols are non-nullish, non-number)", () => {
      const s = Symbol("x");
      const fallback = Symbol("fallback");
      expect(() => defaultTo<symbol>(s, fallback)).not.toThrow();
      expect(defaultTo<symbol>(s, fallback)).toBe(s);
    });

    it("does not throw on void 0 (the documented `undefined` spelling)", () => {
      expect(() => defaultTo(void 0, "fallback")).not.toThrow();
      expect(defaultTo(void 0, "fallback")).toBe("fallback");
    });

    it("does not throw on document.all (a non-null object that typeof reports as undefined)", () => {
      // document.all is famously typeof === "undefined" while not actually
      // undefined. The function's strict `=== undefined` check correctly
      // treats it as a non-nullish value and returns it as-is.
      const all = (globalThis as { document?: { all?: unknown } }).document
        ?.all as unknown;
      if (all === null || all === undefined) {
        // Environment without document.all — skip the typeof check.
        return;
      }
      expect(defaultTo(all, { fallback: true })).toBe(all);
    });
  });
});
