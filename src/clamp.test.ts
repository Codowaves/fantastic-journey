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
});
