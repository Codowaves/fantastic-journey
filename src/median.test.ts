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

  it("returns the average of the two middle values for a two-element array", () => {
    expect(median([1, 2])).toBe(1.5);
  });

  it("handles an already-sorted odd-length array", () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
  });

  it("handles a reverse-sorted odd-length array", () => {
    expect(median([5, 4, 3, 2, 1])).toBe(3);
  });

  it("handles a reverse-sorted even-length array", () => {
    expect(median([4, 3, 2, 1])).toBe(2.5);
  });

  it("handles negative numbers", () => {
    expect(median([-3, -1, -2])).toBe(-2);
  });

  it("handles a mix of negative and positive numbers", () => {
    expect(median([-2, -1, 0, 1, 2])).toBe(0);
  });

  it("returns the single value when all elements are equal", () => {
    expect(median([4, 4, 4, 4, 4])).toBe(4);
  });

  it("handles duplicates with an odd-length array", () => {
    expect(median([1, 3, 3, 3, 5])).toBe(3);
  });

  it("handles duplicates with an even-length array", () => {
    expect(median([1, 1, 3, 3])).toBe(2);
  });

  it("handles fractional values", () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5);
  });

  it("handles a large odd-length array", () => {
    const nums = Array.from({ length: 101 }, (_, i) => i);
    expect(median(nums)).toBe(50);
  });

  it("handles a large even-length array", () => {
    const nums = Array.from({ length: 100 }, (_, i) => i);
    expect(median(nums)).toBe(49.5);
  });

  it("does not mutate the original array", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });
});
