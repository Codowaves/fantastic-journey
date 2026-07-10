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

  it("returns lo when n equals the lower bound", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns hi when n equals the upper bound", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("returns the sole value when lo equals hi", () => {
    expect(clamp(5, 7, 7)).toBe(7);
    expect(clamp(7, 7, 7)).toBe(7);
    expect(clamp(10, 7, 7)).toBe(7);
  });

  it("handles negative bounds", () => {
    expect(clamp(-15, -10, -5)).toBe(-10);
    expect(clamp(-7, -10, -5)).toBe(-7);
    expect(clamp(0, -10, -5)).toBe(-5);
  });

  it("handles floating point values", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(-0.1, 0, 1)).toBe(0);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });

  it("handles Infinity inputs without throwing", () => {
    expect(clamp(Infinity, 0, 10)).toBe(10);
    expect(clamp(-Infinity, 0, 10)).toBe(0);
    expect(clamp(5, -Infinity, 10)).toBe(5);
    expect(clamp(5, 0, Infinity)).toBe(5);
  });
});
