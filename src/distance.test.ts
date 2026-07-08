import { describe, expect, it } from "vitest";

import { euclidean, manhattan } from "./distance";

describe("euclidean", () => {
  it("returns 0 for identical points", () => {
    expect(euclidean(3, 4, 3, 4)).toBe(0);
  });

  it("computes the diagonal distance between axis-aligned points", () => {
    expect(euclidean(0, 0, 3, 4)).toBe(5);
  });

  it("handles negative coordinates", () => {
    expect(euclidean(-1, -1, 2, 3)).toBe(5);
  });

  it("is symmetric", () => {
    expect(euclidean(1, 2, 4, 6)).toBe(euclidean(4, 6, 1, 2));
  });

  it("returns 0 when both points are at the origin", () => {
    expect(euclidean(0, 0, 0, 0)).toBe(0);
  });

  it("handles very large coordinates", () => {
    expect(euclidean(0, 0, 3e8, 4e8)).toBe(5e8);
  });

  it("handles very small (fractional) coordinates", () => {
    expect(euclidean(0, 0, 0.3, 0.4)).toBeCloseTo(0.5);
  });

  it("returns NaN when any coordinate is NaN", () => {
    expect(euclidean(NaN, 0, 1, 1)).toBeNaN();
    expect(euclidean(0, NaN, 1, 1)).toBeNaN();
    expect(euclidean(0, 0, NaN, 1)).toBeNaN();
    expect(euclidean(0, 0, 1, NaN)).toBeNaN();
  });

  it("returns Infinity when any coordinate is Infinity", () => {
    expect(euclidean(Infinity, 0, 1, 1)).toBe(Infinity);
    expect(euclidean(0, 0, Infinity, 0)).toBe(Infinity);
  });
});

describe("euclidean edge cases", () => {
  it("returns 0 when only one coordinate differs (along an axis)", () => {
    expect(euclidean(5, 0, 5, 0)).toBe(0);
    expect(euclidean(0, 5, 0, 5)).toBe(0);
  });

  it("returns the absolute axis difference for axis-aligned points", () => {
    expect(euclidean(0, 0, 7, 0)).toBe(7);
    expect(euclidean(0, 0, 0, 9)).toBe(9);
    expect(euclidean(-4, -4, 0, 0)).toBeCloseTo(Math.sqrt(32));
  });

  it("handles points straddling the origin in opposite quadrants", () => {
    expect(euclidean(-3, -4, 3, 4)).toBeCloseTo(10);
  });

  it("handles very small positive differences (subnormal magnitude)", () => {
    expect(euclidean(0, 0, 1e-10, 0)).toBeCloseTo(1e-10);
  });

  it("returns Infinity when the squared magnitude overflows", () => {
    expect(euclidean(0, 0, 1e308, 1e308)).toBe(Infinity);
  });

  it("returns NaN for non-finite string inputs coerced as NaN", () => {
    // @ts-expect-error – verifying runtime behavior with an invalid type
    expect(Number.isNaN(euclidean("a", 0, 1, 1))).toBe(true);
  });
});

describe("manhattan", () => {
  it("returns 0 for identical points", () => {
    expect(manhattan(3, 4, 3, 4)).toBe(0);
  });

  it("sums absolute differences along each axis", () => {
    expect(manhattan(0, 0, 3, 4)).toBe(7);
  });

  it("handles negative coordinates", () => {
    expect(manhattan(-1, -1, 2, 3)).toBe(7);
  });

  it("is symmetric", () => {
    expect(manhattan(1, 2, 4, 6)).toBe(manhattan(4, 6, 1, 2));
  });

  it("returns 0 when both points are at the origin", () => {
    expect(manhattan(0, 0, 0, 0)).toBe(0);
  });

  it("handles very large coordinates", () => {
    expect(manhattan(0, 0, 3e8, 4e8)).toBe(7e8);
  });

  it("handles very small (fractional) coordinates", () => {
    expect(manhattan(0, 0, 0.3, 0.4)).toBeCloseTo(0.7);
  });

  it("returns NaN when any coordinate is NaN", () => {
    expect(manhattan(NaN, 0, 1, 1)).toBeNaN();
    expect(manhattan(0, NaN, 1, 1)).toBeNaN();
    expect(manhattan(0, 0, NaN, 1)).toBeNaN();
    expect(manhattan(0, 0, 1, NaN)).toBeNaN();
  });

  it("returns Infinity when any coordinate is Infinity", () => {
    expect(manhattan(Infinity, 0, 1, 1)).toBe(Infinity);
    expect(manhattan(0, 0, Infinity, 0)).toBe(Infinity);
  });
});

describe("manhattan edge cases", () => {
  it("returns 0 when only one coordinate differs (along an axis)", () => {
    expect(manhattan(5, 0, 5, 0)).toBe(0);
    expect(manhattan(0, 5, 0, 5)).toBe(0);
  });

  it("returns the absolute axis difference for axis-aligned points", () => {
    expect(manhattan(0, 0, 7, 0)).toBe(7);
    expect(manhattan(0, 0, 0, 9)).toBe(9);
    expect(manhattan(-4, -4, 0, 0)).toBe(8);
  });

  it("handles points straddling the origin in opposite quadrants", () => {
    expect(manhattan(-3, -4, 3, 4)).toBe(14);
  });

  it("handles very small positive differences (subnormal magnitude)", () => {
    expect(manhattan(0, 0, 1e-10, 0)).toBeCloseTo(1e-10);
  });

  it("returns Infinity when an axis difference overflows", () => {
    expect(manhattan(0, 0, 1e308, 1e308)).toBe(Infinity);
  });

  it("returns NaN for non-finite string inputs coerced as NaN", () => {
    // @ts-expect-error – verifying runtime behavior with an invalid type
    expect(Number.isNaN(manhattan("a", 0, 1, 1))).toBe(true);
  });
});
