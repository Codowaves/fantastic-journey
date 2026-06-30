import { describe, expect, it } from "vitest";
import { safeDivide } from "./safe-divide";

describe("safeDivide", () => {
  it("divides two finite numbers", () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(9, 4)).toBe(2.25);
    expect(safeDivide(-10, 2)).toBe(-5);
  });

  it("returns 0 when dividing by zero", () => {
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(0, 0)).toBe(0);
    expect(safeDivide(-5, 0)).toBe(0);
  });

  it("returns 0 when numerator is NaN", () => {
    expect(safeDivide(NaN, 2)).toBe(0);
  });

  it("returns 0 when denominator is NaN", () => {
    expect(safeDivide(2, NaN)).toBe(0);
  });

  it("returns 0 when both inputs are NaN", () => {
    expect(safeDivide(NaN, NaN)).toBe(0);
  });

  it("returns 0 when result is Infinity", () => {
    expect(safeDivide(Infinity, 0)).toBe(0);
    expect(safeDivide(1, 0)).toBe(0);
  });

  it("returns 0 when result is -Infinity", () => {
    expect(safeDivide(-Infinity, 0)).toBe(0);
  });

  it("returns 0 when numerator is Infinity", () => {
    expect(safeDivide(Infinity, 1)).toBe(0);
    expect(safeDivide(-Infinity, 1)).toBe(0);
  });
});
