import { describe, expect, it } from "vitest";

import { factorial } from "./factorial";

describe("factorial", () => {
  it("returns 1 for 0", () => {
    expect(factorial(0)).toBe(1);
  });

  it("returns 1 for 1", () => {
    expect(factorial(1)).toBe(1);
  });

  it("computes 5! as 120", () => {
    expect(factorial(5)).toBe(120);
  });

  it("computes larger values correctly", () => {
    expect(factorial(10)).toBe(3628800);
  });

  it("throws on negative input", () => {
    expect(() => factorial(-1)).toThrow(RangeError);
  });

  it("throws on a larger negative input", () => {
    expect(() => factorial(-100)).toThrow(RangeError);
  });

  it("throws on non-integer numbers", () => {
    expect(() => factorial(2.5)).toThrow(RangeError);
    expect(() => factorial(0.1)).toThrow(RangeError);
  });

  it("throws on NaN", () => {
    expect(() => factorial(Number.NaN)).toThrow(RangeError);
  });

  it("throws on Infinity", () => {
    expect(() => factorial(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("throws on non-number types", () => {
    // @ts-expect-error - intentionally passing a string to test runtime guard
    expect(() => factorial("5")).toThrow(RangeError);
    // @ts-expect-error - intentionally passing null to test runtime guard
    expect(() => factorial(null)).toThrow(RangeError);
    // @ts-expect-error - intentionally passing undefined to test runtime guard
    expect(() => factorial(undefined)).toThrow(RangeError);
  });
});
