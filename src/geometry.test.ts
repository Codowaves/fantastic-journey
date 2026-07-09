import { describe, expect, it } from "vitest";

import { circleArea, rectArea } from "./geometry";

describe("circleArea", () => {
  it("returns 0 for radius 0", () => {
    expect(circleArea(0)).toBe(0);
  });

  it("computes PI * r^2 for radius 1", () => {
    expect(circleArea(1)).toBeCloseTo(Math.PI);
  });

  it("computes PI * r^2 for radius 5", () => {
    expect(circleArea(5)).toBeCloseTo(78.53981633974483);
  });

  it("throws RangeError for negative radius", () => {
    expect(() => circleArea(-1)).toThrow(RangeError);
    expect(() => circleArea(-1)).toThrow("radius must be non-negative");
  });

  it("throws TypeError when radius is null, undefined, or NaN", () => {
    expect(() => circleArea(null as unknown as number)).toThrow(TypeError);
    expect(() => circleArea(undefined as unknown as number)).toThrow(TypeError);
    expect(() => circleArea(Number.NaN)).toThrow(TypeError);
  });
});

describe("rectArea", () => {
  it("returns 0 when width or height is 0", () => {
    expect(rectArea(0, 5)).toBe(0);
    expect(rectArea(5, 0)).toBe(0);
  });

  it("multiplies width and height", () => {
    expect(rectArea(3, 4)).toBe(12);
    expect(rectArea(2.5, 4)).toBe(10);
  });

  it("throws RangeError for negative width or height", () => {
    expect(() => rectArea(-1, 5)).toThrow(RangeError);
    expect(() => rectArea(5, -1)).toThrow(RangeError);
    expect(() => rectArea(-1, 5)).toThrow(
      "width and height must be non-negative",
    );
  });

  it("throws TypeError when width or height is null, undefined, or NaN", () => {
    expect(() => rectArea(null as unknown as number, 5)).toThrow(TypeError);
    expect(() => rectArea(5, null as unknown as number)).toThrow(TypeError);
    expect(() => rectArea(undefined as unknown as number, 5)).toThrow(
      TypeError,
    );
    expect(() => rectArea(5, undefined as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => rectArea(Number.NaN, 5)).toThrow(TypeError);
    expect(() => rectArea(5, Number.NaN)).toThrow(TypeError);
  });
});
