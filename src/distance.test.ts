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

  it("measures pure x-axis movement", () => {
    expect(euclidean(2, 5, 7, 5)).toBe(5);
  });

  it("measures pure y-axis movement", () => {
    expect(euclidean(4, 1, 4, 9)).toBe(8);
  });

  it("handles points straddling the origin", () => {
    expect(euclidean(-5, -5, 5, 5)).toBeCloseTo(Math.sqrt(200));
  });

  it("satisfies the triangle inequality (Euclidean <= Manhattan on the same pair)", () => {
    const ax = -3,
      ay = 2,
      bx = 4,
      by = -1;
    expect(euclidean(ax, ay, bx, by)).toBeLessThanOrEqual(
      manhattan(ax, ay, bx, by),
    );
  });

  it("returns Infinity for -Infinity coordinates", () => {
    expect(euclidean(-Infinity, 0, 1, 1)).toBe(Infinity);
    expect(euclidean(0, 0, -Infinity, 0)).toBe(Infinity);
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

  it("measures pure x-axis movement", () => {
    expect(manhattan(2, 5, 7, 5)).toBe(5);
  });

  it("measures pure y-axis movement", () => {
    expect(manhattan(4, 1, 4, 9)).toBe(8);
  });

  it("handles points straddling the origin", () => {
    expect(manhattan(-5, -5, 5, 5)).toBe(20);
  });

  it("always meets or exceeds the Euclidean distance", () => {
    const ax = -3,
      ay = 2,
      bx = 4,
      by = -1;
    expect(manhattan(ax, ay, bx, by)).toBeGreaterThanOrEqual(
      euclidean(ax, ay, bx, by),
    );
  });

  it("returns Infinity for -Infinity coordinates", () => {
    expect(manhattan(-Infinity, 0, 1, 1)).toBe(Infinity);
    expect(manhattan(0, 0, -Infinity, 0)).toBe(Infinity);
  });
});
