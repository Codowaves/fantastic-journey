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

  it("handles a two-element array (smallest even length)", () => {
    expect(median([10, 20])).toBe(15);
  });

  it("handles all-negative numbers", () => {
    expect(median([-5, -1, -3])).toBe(-3);
  });

  it("handles mixed positive and negative numbers", () => {
    expect(median([-10, 0, 10])).toBe(0);
  });

  it("handles floating-point values without precision loss", () => {
    expect(median([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
  });

  it("returns the shared value when all elements are equal", () => {
    expect(median([4, 4, 4, 4])).toBe(4);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });

  it("handles repeated values around the median", () => {
    expect(median([1, 1, 2, 2, 3, 3])).toBe(2);
  });

  it("returns NaN when any element is NaN", () => {
    expect(Number.isNaN(median([1, NaN, 3]))).toBe(true);
  });

  it("returns Infinity when all elements are Infinity", () => {
    expect(median([Infinity, Infinity, Infinity])).toBe(Infinity);
  });
});
