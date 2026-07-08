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

  it("handles a single negative value", () => {
    expect(median([-5])).toBe(-5);
  });

  it("handles an odd-length array of all negative numbers", () => {
    expect(median([-3, -1, -5])).toBe(-3);
  });

  it("handles an even-length array of all negative numbers", () => {
    expect(median([-4, -1, -2, -3])).toBe(-2.5);
  });

  it("handles an array of zeros", () => {
    expect(median([0, 0, 0])).toBe(0);
  });

  it("handles mixed positive and negative numbers (odd length)", () => {
    expect(median([-2, 3, -1, 0, 4])).toBe(0);
  });

  it("handles mixed positive and negative numbers (even length)", () => {
    expect(median([-1, 2, -3, 4])).toBe(0.5);
  });

  it("handles an already-sorted array", () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
  });

  it("handles a descending-order array", () => {
    expect(median([5, 4, 3, 2, 1])).toBe(3);
  });

  it("handles duplicate values in an odd-length array", () => {
    expect(median([2, 2, 2, 2, 2])).toBe(2);
  });

  it("handles duplicate values in an even-length array", () => {
    expect(median([1, 1, 3, 3])).toBe(2);
  });

  it("handles floating-point values", () => {
    expect(median([0.1, 0.2, 0.3, 0.4])).toBeCloseTo(0.25);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });

  it("handles a large array", () => {
    const arr = Array.from({ length: 1001 }, (_, i) => 1001 - i);
    expect(median(arr)).toBe(501);
  });
});
