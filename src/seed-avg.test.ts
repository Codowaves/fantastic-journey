import { describe, it, expect } from "vitest";
import { average } from "./seed-avg";

describe("average", () => {
  it("computes mean of positive integers", () => {
    expect(average([2, 4, 6])).toBe(4);
  });

  it("returns 0 for an empty array", () => {
    expect(average([])).toBe(0);
  });

  it("returns the only element for a single-element array", () => {
    expect(average([7])).toBe(7);
  });

  it("returns 0 for a single zero", () => {
    expect(average([0])).toBe(0);
  });

  it("returns 0 when all elements are zero", () => {
    expect(average([0, 0, 0, 0])).toBe(0);
  });

  it("handles all-negative integers", () => {
    expect(average([-2, -4, -6])).toBe(-4);
  });

  it("handles mixed positive and negative numbers", () => {
    expect(average([-2, 4, 6])).toBeCloseTo(8 / 3);
  });

  it("produces a decimal result from integer inputs", () => {
    expect(average([1, 2])).toBe(1.5);
  });

  it("propagates NaN", () => {
    expect(Number.isNaN(average([NaN]))).toBe(true);
  });

  it("returns Infinity when all elements are Infinity", () => {
    expect(average([Infinity, Infinity])).toBe(Infinity);
  });

  it("returns -Infinity for negative-infinity input", () => {
    expect(average([-Infinity])).toBe(-Infinity);
  });

  it("treats Infinity mixed with a finite number as Infinity", () => {
    expect(average([1, Infinity])).toBe(Infinity);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4];
    const snapshot = [...input];
    average(input);
    expect(input).toEqual(snapshot);
  });
});
