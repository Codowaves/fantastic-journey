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

  it("throws TypeError for null radius", () => {
    expect(() => circleArea(null as unknown as number)).toThrow(TypeError);
    expect(() => circleArea(null as unknown as number)).toThrow(
      "radius must not be null or undefined",
    );
  });

  it("throws TypeError for undefined radius", () => {
    expect(() => circleArea(undefined as unknown as number)).toThrow(TypeError);
    expect(() => circleArea(undefined as unknown as number)).toThrow(
      "radius must not be null or undefined",
    );
  });

  it("throws TypeError for NaN radius", () => {
    expect(() => circleArea(NaN)).toThrow(TypeError);
    expect(() => circleArea(NaN)).toThrow("radius must not be NaN");
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

  it("throws TypeError for null width", () => {
    expect(() => rectArea(null as unknown as number, 5)).toThrow(TypeError);
    expect(() => rectArea(null as unknown as number, 5)).toThrow(
      "width must not be null or undefined",
    );
  });

  it("throws TypeError for null height", () => {
    expect(() => rectArea(5, null as unknown as number)).toThrow(TypeError);
    expect(() => rectArea(5, null as unknown as number)).toThrow(
      "height must not be null or undefined",
    );
  });

  it("throws TypeError for undefined width", () => {
    expect(() => rectArea(undefined as unknown as number, 5)).toThrow(
      TypeError,
    );
    expect(() => rectArea(undefined as unknown as number, 5)).toThrow(
      "width must not be null or undefined",
    );
  });

  it("throws TypeError for undefined height", () => {
    expect(() => rectArea(5, undefined as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => rectArea(5, undefined as unknown as number)).toThrow(
      "height must not be null or undefined",
    );
  });

  it("throws TypeError for NaN width", () => {
    expect(() => rectArea(NaN, 5)).toThrow(TypeError);
    expect(() => rectArea(NaN, 5)).toThrow("width must not be NaN");
  });

  it("throws TypeError for NaN height", () => {
    expect(() => rectArea(5, NaN)).toThrow(TypeError);
    expect(() => rectArea(5, NaN)).toThrow("height must not be NaN");
  });
});
