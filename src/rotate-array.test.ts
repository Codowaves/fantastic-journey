import { describe, expect, it } from "vitest";

import { rotateArray } from "./rotate-array";

describe("rotateArray", () => {
  it("rotates left by n positions", () => {
    expect(rotateArray([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5, 1, 2]);
  });

  it("returns a copy when n is zero", () => {
    const input = [1, 2, 3];
    const result = rotateArray(input, 0);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(input);
  });

  it("returns a copy when n equals the array length", () => {
    const input = [1, 2, 3];
    expect(rotateArray(input, 3)).toEqual([1, 2, 3]);
  });

  it("wraps when n is larger than the array length", () => {
    expect(rotateArray([1, 2, 3, 4], 5)).toEqual([2, 3, 4, 1]);
  });

  it("rotates right when n is negative", () => {
    expect(rotateArray([1, 2, 3, 4, 5], -1)).toEqual([5, 1, 2, 3, 4]);
  });

  it("handles negative n larger than the array length (wrap)", () => {
    expect(rotateArray([1, 2, 3, 4, 5], -6)).toEqual([5, 1, 2, 3, 4]);
  });

  it("returns an empty array for empty input", () => {
    expect(rotateArray<number>([], 3)).toEqual([]);
  });

  it("preserves element types for non-number arrays", () => {
    expect(rotateArray(["a", "b", "c", "d"], 1)).toEqual(["b", "c", "d", "a"]);
  });

  it("truncates non-integer n toward zero", () => {
    expect(rotateArray([1, 2, 3, 4, 5], 2.7)).toEqual([3, 4, 5, 1, 2]);
    expect(rotateArray([1, 2, 3, 4, 5], -1.7)).toEqual([5, 1, 2, 3, 4]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    rotateArray(input, 2);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("throws RangeError when n is NaN", () => {
    expect(() => rotateArray([1, 2, 3], Number.NaN)).toThrow(RangeError);
  });

  it("throws RangeError when n is Infinity", () => {
    expect(() => rotateArray([1, 2, 3], Infinity)).toThrow(RangeError);
  });

  it("throws RangeError when n is -Infinity", () => {
    expect(() => rotateArray([1, 2, 3], -Infinity)).toThrow(RangeError);
  });

  it("returns an empty array when n is non-zero but input is empty", () => {
    expect(rotateArray<string>([], -5)).toEqual([]);
    expect(rotateArray<number>([], 0)).toEqual([]);
  });

  it("throws RangeError on empty input when n is NaN", () => {
    expect(() => rotateArray([], NaN)).toThrow(RangeError);
  });

  it("throws RangeError on empty input when n is Infinity", () => {
    expect(() => rotateArray([], Infinity)).toThrow(RangeError);
    expect(() => rotateArray([], -Infinity)).toThrow(RangeError);
  });

  it("rotates a single-element array regardless of n", () => {
    expect(rotateArray([42], 1)).toEqual([42]);
    expect(rotateArray([42], -1)).toEqual([42]);
    expect(rotateArray([42], 99)).toEqual([42]);
  });

  it("does not return the same reference for single-element arrays", () => {
    const input = [42];
    const result = rotateArray(input, 0);
    expect(result).toEqual([42]);
    expect(result).not.toBe(input);
  });

  it("rotates by exactly one position for a two-element array", () => {
    expect(rotateArray([1, 2], 1)).toEqual([2, 1]);
    expect(rotateArray([1, 2], -1)).toEqual([2, 1]);
  });

  it("handles n that is exactly -len", () => {
    expect(rotateArray([1, 2, 3, 4], -4)).toEqual([1, 2, 3, 4]);
  });

  it("handles fractional n that truncates to zero", () => {
    expect(rotateArray([1, 2, 3, 4, 5], 0.4)).toEqual([1, 2, 3, 4, 5]);
    expect(rotateArray([1, 2, 3, 4, 5], -0.4)).toEqual([1, 2, 3, 4, 5]);
  });

  it("rotates by very large n (multiple wraps)", () => {
    expect(rotateArray([1, 2, 3], 1e10)).toEqual([2, 3, 1]);
    expect(rotateArray([1, 2, 3], -1e10)).toEqual([3, 1, 2]);
  });

  it("preserves complex element types including null and undefined", () => {
    const input: Array<number | null | undefined> = [1, null, undefined, 2];
    expect(rotateArray(input, 1)).toEqual([null, undefined, 2, 1]);
  });
});
