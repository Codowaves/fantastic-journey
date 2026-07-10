import { describe, expect, it } from "vitest";

import { average } from "./seed-avg";

describe("average", () => {
  it("averages positive numbers", () => {
    expect(average([2, 4, 6])).toBe(4);
  });

  it("returns 0 for an empty array", () => {
    expect(average([])).toBe(0);
  });

  it("returns the only value for a single-item array", () => {
    expect(average([7])).toBe(7);
  });

  it("averages negative and decimal boundary values", () => {
    expect(average([-1.5, 0, 1.5])).toBe(0);
  });

  it("returns NaN when any input is NaN", () => {
    expect(average([1, Number.NaN, 3])).toBeNaN();
  });

  it("returns Infinity when the sum overflows", () => {
    expect(average([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(Infinity);
  });
});
