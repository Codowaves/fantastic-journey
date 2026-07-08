import { describe, expect, it } from "vitest";

import { average } from "./seed-avg";

describe("average", () => {
  it("computes the arithmetic mean of a small array", () => {
    expect(average([2, 4, 6])).toBe(4);
  });

  it("returns 0 for an empty array", () => {
    expect(average([])).toBe(0);
  });

  it("returns the single element when given a one-element array", () => {
    expect(average([42])).toBe(42);
  });

  it("handles a single negative number", () => {
    expect(average([-7])).toBe(-7);
  });

  it("handles a single zero", () => {
    expect(average([0])).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(average([-2, -4, -6])).toBe(-4);
  });

  it("handles a mix of positive and negative numbers", () => {
    expect(average([-2, 4, -6, 8])).toBe(1);
  });

  it("returns 0 when all elements are zero", () => {
    expect(average([0, 0, 0, 0])).toBe(0);
  });

  it("sums positive and negative elements that cancel out", () => {
    expect(average([-5, 5])).toBe(0);
  });

  it("handles floating-point values", () => {
    expect(average([0.1, 0.2, 0.3])).toBeCloseTo(0.2, 10);
  });

  it("handles very large numbers without overflow", () => {
    expect(average([1e15, 1e15])).toBe(1e15);
  });

  it("handles Infinity", () => {
    expect(average([Infinity, 1])).toBe(Infinity);
  });

  it("handles -Infinity", () => {
    expect(average([-Infinity, 1])).toBe(-Infinity);
  });

  it("produces NaN when inputs include NaN", () => {
    expect(Number.isNaN(average([1, NaN, 3]))).toBe(true);
  });

  it("handles a long array consistently", () => {
    const ns = Array.from({ length: 1000 }, (_, i) => i + 1);
    expect(average(ns)).toBe(500.5);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    average(input);
    expect(input).toEqual([1, 2, 3]);
  });
});
