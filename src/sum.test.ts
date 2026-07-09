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

  it("returns 0 for an array of zeros", () => {
    expect(sum([0, 0, 0])).toBe(0);
  });

  it("handles a single zero", () => {
    expect(sum([0])).toBe(0);
  });

  it("sums negative numbers", () => {
    expect(sum([-1, -2, -3])).toBe(-6);
  });

  it("sums mixed positive and negative numbers", () => {
    expect(sum([-5, 10, -3, 2])).toBe(4);
  });

  it("sums floating-point numbers", () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });

  it("handles a single negative number", () => {
    expect(sum([-42])).toBe(-42);
  });

  it("treats NaN as producing NaN", () => {
    expect(Number.isNaN(sum([1, NaN, 2]))).toBe(true);
  });

  it("treats Infinity as producing Infinity", () => {
    expect(sum([1, 2, Infinity])).toBe(Infinity);
  });

  it("treats -Infinity as producing -Infinity", () => {
    expect(sum([-1, -2, -Infinity])).toBe(-Infinity);
  });

  it("Infinity minus Infinity yields NaN", () => {
    expect(Number.isNaN(sum([Infinity, -Infinity]))).toBe(true);
  });

  it("handles Number.MAX_SAFE_INTEGER boundaries without overflow", () => {
    expect(sum([Number.MAX_SAFE_INTEGER, 1])).toBe(Number.MAX_SAFE_INTEGER + 1);
  });

  it("handles very large numbers", () => {
    expect(sum([1e10, 2e10, 3e10])).toBe(6e10);
  });

  it("handles very small fractional numbers", () => {
    expect(sum([1e-10, 2e-10, 3e-10])).toBeCloseTo(6e-10);
  });
});
