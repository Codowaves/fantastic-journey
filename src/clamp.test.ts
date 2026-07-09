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

  it("throws TypeError when lo is null or undefined", () => {
    expect(() => clamp(5, null as unknown as number, 10)).toThrow(TypeError);
    expect(() => clamp(5, undefined as unknown as number, 10)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when hi is null or undefined", () => {
    expect(() => clamp(5, 0, null as unknown as number)).toThrow(TypeError);
    expect(() => clamp(5, 0, undefined as unknown as number)).toThrow(
      TypeError,
    );
  });

  it("returns lo when value equals lo (boundary)", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns hi when value equals hi (boundary)", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("handles floating-point values", () => {
    expect(clamp(1.5, 0, 2)).toBe(1.5);
    expect(clamp(-0.5, 0, 2)).toBe(0);
    expect(clamp(2.5, 0, 2)).toBe(2);
  });

  it("handles Infinity within range", () => {
    expect(clamp(Infinity, 0, 10)).toBe(10);
    expect(clamp(-Infinity, 0, 10)).toBe(0);
  });

  it("handles zero-width range (lo === hi)", () => {
    expect(clamp(5, 3, 3)).toBe(3);
    expect(clamp(3, 3, 3)).toBe(3);
    expect(clamp(1, 3, 3)).toBe(3);
  });

  it("returns hi when lo === hi and value is above hi", () => {
    expect(clamp(5, 10, 10)).toBe(10);
  });
});
