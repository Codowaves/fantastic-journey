import { describe, expect, it } from "vitest";

import { clamp } from "./num-utils";

describe("clamp", () => {
  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(7.5, 5, 10)).toBe(7.5);
  });

  it("returns the minimum when the value is below the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(3, 5, 10)).toBe(5);
  });

  it("returns the maximum when the value is above the range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, 5, 10)).toBe(10);
  });

  it("returns the value when it equals the minimum bound", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns the value when it equals the maximum bound", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("handles ranges where min equals max", () => {
    expect(clamp(5, 7, 7)).toBe(7);
    expect(clamp(7, 7, 7)).toBe(7);
  });

  it("handles fractional numbers", () => {
    expect(clamp(2.5, 1.0, 3.0)).toBe(2.5);
    expect(clamp(0.5, 1.0, 3.0)).toBe(1.0);
    expect(clamp(3.5, 1.0, 3.0)).toBe(3.0);
  });

  describe("error/throw paths", () => {
    it("does not throw on a normal call", () => {
      expect(() => clamp(5, 0, 10)).not.toThrow();
    });

    it("does not throw when the value is NaN", () => {
      // Math.min/max propagate NaN, so the result is NaN — no throw.
      expect(() => clamp(Number.NaN, 0, 10)).not.toThrow();
      expect(Number.isNaN(clamp(Number.NaN, 0, 10))).toBe(true);
    });

    it("does not throw when the lower bound is NaN", () => {
      expect(() => clamp(5, Number.NaN, 10)).not.toThrow();
      expect(Number.isNaN(clamp(5, Number.NaN, 10))).toBe(true);
    });

    it("does not throw when the upper bound is NaN", () => {
      expect(() => clamp(5, 0, Number.NaN)).not.toThrow();
      expect(Number.isNaN(clamp(5, 0, Number.NaN))).toBe(true);
    });

    it("does not throw when the value is +Infinity", () => {
      expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
    });

    it("does not throw when the value is -Infinity", () => {
      expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    });

    it("does not throw when the value is +0 and bounds are integers", () => {
      expect(clamp(+0, 0, 10)).toBe(0);
      expect(Object.is(clamp(+0, 0, 10), +0)).toBe(true);
    });

    it("does not throw when the value is -0 and bounds are integers", () => {
      expect(clamp(-0, 0, 10)).toBe(0);
    });

    it("does not throw when the lower bound is greater than the upper bound", () => {
      // clamp does not validate the ordering of bounds; Math.max(n, min) is
      // computed first (returning min), then Math.min(..., max) clamps it
      // to max. With min > max the value is collapsed to max.
      expect(() => clamp(5, 10, 0)).not.toThrow();
      expect(clamp(5, 10, 0)).toBe(0);
      expect(clamp(0, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(0);
    });

    it("does not throw when min equals max at any numeric value", () => {
      expect(clamp(0, 7, 7)).toBe(7);
      expect(clamp(7, 7, 7)).toBe(7);
      expect(clamp(100, 7, 7)).toBe(7);
    });

    it("does not throw when the value is a very large finite number", () => {
      expect(clamp(Number.MAX_SAFE_INTEGER, 0, 100)).toBe(100);
    });

    it("does not throw when the value is a very small finite number", () => {
      expect(clamp(-Number.MAX_SAFE_INTEGER, 0, 100)).toBe(0);
    });
  });
});
