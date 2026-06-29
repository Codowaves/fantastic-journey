import { describe, expect, it } from "vitest";

import { movingAverage } from "./moving-average";

describe("movingAverage", () => {
  it("returns an empty array when the window is larger than the series", () => {
    expect(movingAverage([1, 2, 3], 5)).toEqual([]);
  });

  it("returns a single average when the window equals the series length", () => {
    expect(movingAverage([2, 4, 6, 8], 4)).toEqual([5]);
  });

  it("computes the sliding-window averages", () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toEqual([2, 3, 4]);
  });

  it("handles an empty series", () => {
    expect(movingAverage([], 3)).toEqual([]);
  });

  it("throws when the window size is not positive", () => {
    expect(() => movingAverage([1, 2, 3], 0)).toThrow(RangeError);
    expect(() => movingAverage([1, 2, 3], -1)).toThrow(RangeError);
  });
});
