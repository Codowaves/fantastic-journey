import { describe, expect, it } from "vitest";

import { average } from "./seed-avg";

describe("average", () => {
  it("computes the arithmetic mean of a list of numbers", () => {
    expect(average([2, 4, 6])).toBe(4);
  });

  it("returns 0 for an empty array", () => {
    expect(average([])).toBe(0);
  });

  describe("edge cases", () => {
    it("returns the single element when given a one-element array", () => {
      expect(average([42])).toBe(42);
    });

    it("treats zero-quantity contributions as zero (boundary)", () => {
      expect(average([0, 0, 0])).toBe(0);
    });

    it("handles negative numbers correctly", () => {
      expect(average([-4, -2, 0, 2, 4])).toBe(0);
    });

    it("handles a single negative element", () => {
      expect(average([-7])).toBe(-7);
    });

    it("handles floating-point inputs without rounding (boundary)", () => {
      expect(average([1.5, 2.5])).toBe(2);
    });

    it("does not mutate the input array", () => {
      const input = [1, 2, 3];
      const snapshot = [...input];
      average(input);
      expect(input).toEqual(snapshot);
    });
  });
});
