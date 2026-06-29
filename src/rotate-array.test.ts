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
});
