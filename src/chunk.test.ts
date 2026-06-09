import { describe, expect, it } from "vitest";

import { chunk } from "./chunk";

describe("chunk", () => {
  it("returns an empty array when given an empty array", () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it("splits an array into chunks of the given size when it divides evenly", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("returns a single chunk when the array is shorter than size", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("puts the leftover elements in a shorter final chunk", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns each element in its own chunk when size is 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("returns a single chunk when size equals the array length", () => {
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it("handles a single-element array", () => {
    expect(chunk([42], 3)).toEqual([[42]]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4];
    chunk(input, 2);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it("throws RangeError when size is 0", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
  });

  it("throws RangeError when size is negative", () => {
    expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
  });
});
