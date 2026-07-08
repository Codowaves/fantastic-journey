import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns min when value is below the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns max when value is above the range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("throws RangeError when lo > hi", () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clamp(5, 10, 0)).toThrow("lo must be <= hi");
  });

  it("throws TypeError when n is NaN", () => {
    expect(() => clamp(NaN, 0, 10)).toThrow(TypeError);
    expect(() => clamp(NaN, 0, 10)).toThrow("n must be a finite number");
  });

  it("throws TypeError when n is null or undefined", () => {
    expect(() => clamp(null as unknown as number, 0, 10)).toThrow(TypeError);
    expect(() => clamp(undefined as unknown as number, 0, 10)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when lo is NaN", () => {
    expect(() => clamp(5, NaN, 10)).toThrow(TypeError);
    expect(() => clamp(5, NaN, 10)).toThrow("lo must be a finite number");
  });

  it("throws TypeError when hi is NaN", () => {
    expect(() => clamp(5, 0, NaN)).toThrow(TypeError);
    expect(() => clamp(5, 0, NaN)).toThrow("hi must be a finite number");
  });

  it("returns the value when it equals the lower bound", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns the value when it equals the upper bound", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("returns that single value when lo === hi and n equals both", () => {
    expect(clamp(7, 7, 7)).toBe(7);
  });

  it("returns lo when n is below lo and lo === hi", () => {
    expect(clamp(0, 5, 5)).toBe(5);
  });

  it("returns hi when n is above hi and lo === hi", () => {
    expect(clamp(10, 5, 5)).toBe(5);
  });

  it("clamps negative numbers in a negative range", () => {
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("clamps with zero bounds", () => {
    expect(clamp(-5, 0, 0)).toBe(0);
    expect(clamp(0, 0, 0)).toBe(0);
    expect(clamp(5, 0, 0)).toBe(0);
  });

  it("handles floating-point values", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-0.1, 0, 1)).toBe(0);
  });

  it("preserves floating-point precision within range", () => {
    expect(clamp(0.1 + 0.2, 0, 1)).toBeCloseTo(0.30000000000000004);
  });

  it("returns the bound when lo equals hi and n differs", () => {
    expect(clamp(3, 5, 5)).toBe(5);
  });

  it("returns Infinity when hi is Infinity and n is Infinity", () => {
    expect(clamp(Infinity, 0, Infinity)).toBe(Infinity);
  });

  it("returns Infinity when n is Infinity below hi", () => {
    expect(clamp(Infinity, 0, 10)).toBe(10);
  });

  it("returns -Infinity when n is -Infinity", () => {
    expect(clamp(-Infinity, -10, 10)).toBe(-10);
  });

  it("returns -Infinity when lo is -Infinity and n is -Infinity", () => {
    expect(clamp(-Infinity, -Infinity, 0)).toBe(-Infinity);
  });

  it("clamps large values within a wide range", () => {
    expect(clamp(1e10, -1e9, 1e9)).toBe(1e9);
    expect(clamp(-1e10, -1e9, 1e9)).toBe(-1e9);
  });
});
