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
});
