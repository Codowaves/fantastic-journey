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
    it("propagates NaN when the input value is NaN", () => {
      // Math.max(NaN, 0) === NaN; Math.min(NaN, 10) === NaN — clamp must not throw.
      const result = clamp(Number.NaN, 0, 10);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("propagates NaN when the lower bound is NaN", () => {
      const result = clamp(5, Number.NaN, 10);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("propagates NaN when the upper bound is NaN", () => {
      const result = clamp(5, 0, Number.NaN);
      expect(Number.isNaN(result)).toBe(true);
    });

    it("does not throw when the input value is NaN", () => {
      expect(() => clamp(Number.NaN, 0, 10)).not.toThrow();
    });

    it("does not throw when any bound is NaN", () => {
      expect(() => clamp(5, Number.NaN, 10)).not.toThrow();
      expect(() => clamp(5, 0, Number.NaN)).not.toThrow();
      expect(() => clamp(Number.NaN, Number.NaN, Number.NaN)).not.toThrow();
    });

    it("clamps +Infinity down to the upper bound", () => {
      expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
    });

    it("clamps -Infinity up to the lower bound", () => {
      expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    });

    it("returns the value unchanged when bounds span the full real line", () => {
      expect(clamp(5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(
        5,
      );
    });

    it("returns the lower bound when min is +Infinity and value is finite", () => {
      expect(clamp(5, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("does not throw on infinite inputs", () => {
      expect(() => clamp(Number.POSITIVE_INFINITY, 0, 10)).not.toThrow();
      expect(() => clamp(Number.NEGATIVE_INFINITY, 0, 10)).not.toThrow();
      expect(() =>
        clamp(5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      ).not.toThrow();
    });

    it("returns max when min is greater than max (inverted-range fallback)", () => {
      // Math.max(5, 10) === 10; Math.min(10, 0) === 0 — clamps to the smaller of the two bounds.
      expect(clamp(5, 10, 0)).toBe(0);
      expect(clamp(100, 10, 0)).toBe(0);
      expect(clamp(-100, 10, 0)).toBe(0);
    });

    it("does not throw when min is greater than max", () => {
      expect(() => clamp(5, 10, 0)).not.toThrow();
    });

    it("handles Number.MAX_VALUE at the upper bound", () => {
      expect(clamp(Number.MAX_VALUE, 0, 10)).toBe(10);
      expect(clamp(5, 0, Number.MAX_VALUE)).toBe(5);
    });

    it("handles Number.MIN_VALUE (smallest positive number) within the range", () => {
      expect(clamp(Number.MIN_VALUE, 0, 1)).toBe(Number.MIN_VALUE);
    });

    it("does not throw on extreme finite values", () => {
      expect(() => clamp(Number.MAX_VALUE, 0, 10)).not.toThrow();
      expect(() => clamp(Number.MIN_VALUE, 0, 10)).not.toThrow();
      expect(() => clamp(-Number.MAX_VALUE, 0, 10)).not.toThrow();
    });

    it("does not throw when called with zero as every argument", () => {
      expect(() => clamp(0, 0, 0)).not.toThrow();
      expect(clamp(0, 0, 0)).toBe(0);
    });
  });
});
