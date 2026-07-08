import { describe, expect, it } from "vitest";

import { median } from "./median";

describe("median", () => {
  it("returns 0 for an empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(median([7])).toBe(7);
  });

  it("returns the middle value of an odd-length array", () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
  });

  it("returns the average of the two middle values for an even-length array", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("sorts the input before computing the median", () => {
    expect(median([5, 1, 4, 2, 3])).toBe(3);
  });

  it("averages the only two values for a two-element array", () => {
    expect(median([2, 8])).toBe(5);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });

  it("handles negative numbers", () => {
    expect(median([-5, -1, -3])).toBe(-3);
    expect(median([-4, -2, 6, 8])).toBe(2);
  });

  it("handles floats", () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5);
    expect(median([0.1, 0.2, 0.3, 0.4])).toBeCloseTo(0.25);
  });

  it("handles repeated values", () => {
    expect(median([2, 2, 2, 2])).toBe(2);
    expect(median([1, 2, 2, 3])).toBe(2);
  });

  it("handles large values", () => {
    expect(median([1e9, 2e9, 3e9])).toBe(2e9);
  });

  it("returns NaN when the array contains NaN", () => {
    expect(Number.isNaN(median([1, NaN, 3]))).toBe(true);
  });
});
