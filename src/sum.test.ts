import { describe, expect, it } from "vitest";

import { sum } from "./sum";

describe("sum", () => {
  it("returns 0 for an empty array", () => {
    expect(sum([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(sum([7])).toBe(7);
  });

  it("returns the total of multiple values", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it("returns 0 for an array containing a single zero", () => {
    expect(sum([0])).toBe(0);
  });

  it("sums negative numbers", () => {
    expect(sum([-1, -2, -3])).toBe(-6);
  });

  it("handles a mix of positive and negative numbers", () => {
    expect(sum([10, -5, 3, -8])).toBe(0);
  });

  it("sums floating-point numbers", () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });

  it("handles Number.MAX_SAFE_INTEGER without overflow", () => {
    expect(sum([Number.MAX_SAFE_INTEGER, 1])).toBe(Number.MAX_SAFE_INTEGER + 1);
  });

  it("propagates Infinity", () => {
    expect(sum([Infinity, 1])).toBe(Infinity);
  });

  it("handles -Infinity", () => {
    expect(sum([-Infinity, -Infinity])).toBe(-Infinity);
  });

  it("NaN propagates when present in the input", () => {
    expect(Number.isNaN(sum([1, NaN, 3]))).toBe(true);
  });
});
