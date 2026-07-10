import { describe, expect, it } from "vitest";

import { median } from "./median";

describe("median", () => {
  it("returns 0 for an empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns NaN for an array containing only NaN", () => {
    expect(median([NaN, NaN, NaN])).toBeNaN();
  });

  it("propagates NaN when mixed with valid numbers", () => {
    expect(median([1, 2, NaN, 3])).toBeNaN();
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

  it("handles negative numbers", () => {
    expect(median([-5, -1, -3])).toBe(-3);
  });

  it("handles an even-length array of all negative numbers", () => {
    expect(median([-4, -2, -1, -3])).toBe(-2.5);
  });

  it("handles a mix of negative and positive numbers", () => {
    expect(median([-3, -1, 2, 4])).toBe(0.5);
  });

  it("handles duplicates in an odd-length array", () => {
    expect(median([2, 2, 2, 3, 4])).toBe(2);
  });

  it("handles duplicates in an even-length array", () => {
    expect(median([1, 1, 2, 2])).toBe(1.5);
  });

  it("handles all identical values", () => {
    expect(median([5, 5, 5, 5, 5])).toBe(5);
  });

  it("handles a two-element array", () => {
    expect(median([10, 20])).toBe(15);
  });

  it("handles fractional values in an odd-length array", () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5);
  });

  it("handles fractional values in an even-length array", () => {
    expect(median([0.1, 0.2, 0.3, 0.4])).toBeCloseTo(0.25);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2];
    const snapshot = [...input];
    median(input);
    expect(input).toEqual(snapshot);
  });

  it("handles zero in the input", () => {
    expect(median([0, 0, 0])).toBe(0);
  });

  it("handles a mix of zero and positive values", () => {
    expect(median([0, 1, 2, 3, 4])).toBe(2);
  });

  it("handles a large even-length array", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(median(arr)).toBe(50.5);
  });

  it("handles a large odd-length array", () => {
    const arr = Array.from({ length: 101 }, (_, i) => i + 1);
    expect(median(arr)).toBe(51);
  });
});
