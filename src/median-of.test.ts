import { describe, expect, it } from "vitest";

import { medianOf } from "./median-of";

describe("medianOf", () => {
  it("returns 0 for an empty array", () => {
    expect(medianOf([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(medianOf([7])).toBe(7);
  });

  it("returns the single value for a one-element negative array", () => {
    expect(medianOf([-3])).toBe(-3);
  });

  it("returns the middle value of an odd-length array", () => {
    expect(medianOf([1, 2, 3, 4, 5])).toBe(3);
  });

  it("returns the middle value of an odd-length negative array", () => {
    expect(medianOf([-5, -3, -1])).toBe(-3);
  });

  it("returns the average of the two middle values for an even-length array", () => {
    expect(medianOf([1, 2, 3, 4])).toBe(2.5);
  });

  it("returns the average of the two middle values when straddling zero", () => {
    expect(medianOf([-2, -1, 1, 2])).toBe(0);
  });

  it("sorts the input before computing the median", () => {
    expect(medianOf([5, 1, 4, 2, 3])).toBe(3);
  });

  it("sorts a reverse-sorted even array before computing the median", () => {
    expect(medianOf([4, 3, 2, 1])).toBe(2.5);
  });

  it("handles duplicate values", () => {
    expect(medianOf([2, 2, 2, 2])).toBe(2);
  });

  it("does not mutate the input array", () => {
    const input = [5, 1, 4, 2, 3];
    medianOf(input);
    expect(input).toEqual([5, 1, 4, 2, 3]);
  });
});
