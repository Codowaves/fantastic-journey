import { describe, expect, it } from "vitest";

import { clampToRange } from "./clamp-to-range";

describe("clampToRange", () => {
  it("returns min when value is below the range", () => {
    expect(clampToRange(-5, 0, 10)).toBe(0);
  });

  it("returns the value when it is within the range", () => {
    expect(clampToRange(5, 0, 10)).toBe(5);
  });

  it("returns max when value is above the range", () => {
    expect(clampToRange(15, 0, 10)).toBe(10);
  });

  it("returns min when value equals min", () => {
    expect(clampToRange(0, 0, 10)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clampToRange(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clampToRange(-5, -10, -1)).toBe(-5);
    expect(clampToRange(-15, -10, -1)).toBe(-10);
    expect(clampToRange(0, -10, -1)).toBe(-1);
  });

  it("handles floating-point values", () => {
    expect(clampToRange(1.5, 0, 2)).toBe(1.5);
    expect(clampToRange(-0.5, 0, 2)).toBe(0);
    expect(clampToRange(2.5, 0, 2)).toBe(2);
  });

  it("handles zero-width range (lo === hi)", () => {
    expect(clampToRange(5, 3, 3)).toBe(3);
    expect(clampToRange(3, 3, 3)).toBe(3);
    expect(clampToRange(1, 3, 3)).toBe(3);
  });

  it("throws RangeError when min > max", () => {
    expect(() => clampToRange(5, 10, 0)).toThrow(RangeError);
    expect(() => clampToRange(5, 10, 0)).toThrow("min must be <= max");
  });
});
