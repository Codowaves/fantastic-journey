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

  it("returns 1 for -0 (boundary)", () => {
    expect(factorial(-0)).toBe(1);
  });

  it("returns 2 for 2", () => {
    expect(factorial(2)).toBe(2);
  });

  it("computes 12! correctly", () => {
    expect(factorial(12)).toBe(479001600);
  });

  it("computes 18! correctly (last safe-integer factorial)", () => {
    expect(factorial(18)).toBe(6402373705728000);
  });

  it("throws on negative infinity", () => {
    expect(() => factorial(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });

  it("throws on boolean inputs", () => {
    // @ts-expect-error - intentionally passing boolean to test runtime guard
    expect(() => factorial(true)).toThrow(RangeError);
    // @ts-expect-error - intentionally passing boolean to test runtime guard
    expect(() => factorial(false)).toThrow(RangeError);
  });

  it("throws on object inputs", () => {
    // @ts-expect-error - intentionally passing object to test runtime guard
    expect(() => factorial({})).toThrow(RangeError);
    // @ts-expect-error - intentionally passing array to test runtime guard
    expect(() => factorial([])).toThrow(RangeError);
    // @ts-expect-error - intentionally passing array to test runtime guard
    expect(() => factorial([5])).toThrow(RangeError);
  });

  // batch2 edge cases

  it("throws on empty string (empty input)", () => {
    // @ts-expect-error - intentionally passing string to test runtime guard
    expect(() => factorial("")).toThrow(RangeError);
  });

  it("throws on symbol inputs", () => {
    // @ts-expect-error - intentionally passing symbol to test runtime guard
    expect(() => factorial(Symbol("n"))).toThrow();
  });

  it("throws on bigint inputs", () => {
    // @ts-expect-error - intentionally passing bigint to test runtime guard
    expect(() => factorial(5n)).toThrow(RangeError);
  });

  it("throws on function inputs", () => {
    // @ts-expect-error - intentionally passing function to test runtime guard
    expect(() => factorial(() => 5)).toThrow(RangeError);
  });

  it("returns 6 for 3 (small boundary)", () => {
    expect(factorial(3)).toBe(6);
  });

  it("returns 24 for 4 (small boundary)", () => {
    expect(factorial(4)).toBe(24);
  });

  it("computes 20! correctly (boundary: exceeds MAX_SAFE_INTEGER)", () => {
    expect(factorial(20)).toBe(2432902008176640000);
  });

  it("throws on numeric string with valid-looking value", () => {
    // @ts-expect-error - intentionally passing string to test runtime guard
    expect(() => factorial("10")).toThrow(RangeError);
    // @ts-expect-error - intentionally passing string to test runtime guard
    expect(() => factorial("0")).toThrow(RangeError);
  });
});
