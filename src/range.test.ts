import { describe, expect, it } from "vitest";

import { range } from "./range";

describe("range", () => {
  it("returns the integers from start (inclusive) to end (exclusive)", () => {
    expect(range(0, 3)).toEqual([0, 1, 2]);
  });

  it("returns an empty array when end equals start", () => {
    expect(range(2, 2)).toEqual([]);
  });

  it("returns an empty array when end is less than start", () => {
    expect(range(5, 1)).toEqual([]);
  });

  it("returns a single-element array when end is start + 1", () => {
    expect(range(4, 5)).toEqual([4]);
  });

  it("throws a RangeError when start is not an integer", () => {
    expect(() => range(0.5, 3)).toThrow(RangeError);
  });

  it("throws a RangeError when end is not an integer", () => {
    expect(() => range(0, 3.5)).toThrow(RangeError);
  });
});
