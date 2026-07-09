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

  describe("error/throw paths", () => {
    it("does not throw when dividing by zero (fallback branch)", () => {
      expect(() => safeDivide(10, 0)).not.toThrow();
      expect(() => safeDivide(0, 0)).not.toThrow();
      expect(() => safeDivide(-5, 0)).not.toThrow();
    });

    it("does not throw when numerator is NaN", () => {
      expect(() => safeDivide(NaN, 2)).not.toThrow();
    });

    it("does not throw when denominator is NaN", () => {
      expect(() => safeDivide(2, NaN)).not.toThrow();
    });

    it("does not throw when both inputs are NaN", () => {
      expect(() => safeDivide(NaN, NaN)).not.toThrow();
    });

    it("does not throw when numerator is Infinity", () => {
      expect(() => safeDivide(Infinity, 1)).not.toThrow();
      expect(() => safeDivide(-Infinity, 1)).not.toThrow();
    });

    it("does not throw when denominator is Infinity", () => {
      expect(() => safeDivide(10, Infinity)).not.toThrow();
      expect(() => safeDivide(10, -Infinity)).not.toThrow();
    });

    it("does not throw when denominator is -Infinity (finite numerator)", () => {
      expect(() => safeDivide(7, -Infinity)).not.toThrow();
    });

    it("does not throw on any non-finite input combination", () => {
      expect(() => safeDivide(NaN, NaN)).not.toThrow();
      expect(() => safeDivide(NaN, Infinity)).not.toThrow();
      expect(() => safeDivide(Infinity, NaN)).not.toThrow();
      expect(() => safeDivide(-Infinity, Infinity)).not.toThrow();
      expect(() => safeDivide(Infinity, -Infinity)).not.toThrow();
    });

    it("returns 0 (not NaN) from the fallback branch", () => {
      expect(Number.isNaN(safeDivide(10, 0))).toBe(false);
      expect(Number.isNaN(safeDivide(NaN, 2))).toBe(false);
      expect(Number.isNaN(safeDivide(2, NaN))).toBe(false);
      expect(Number.isNaN(safeDivide(NaN, NaN))).toBe(false);
    });

    it("returns a finite number from the fallback branch", () => {
      expect(Number.isFinite(safeDivide(10, 0))).toBe(true);
      expect(Number.isFinite(safeDivide(NaN, 2))).toBe(true);
      expect(Number.isFinite(safeDivide(2, NaN))).toBe(true);
      expect(Number.isFinite(safeDivide(Infinity, 1))).toBe(true);
      expect(Number.isFinite(safeDivide(-Infinity, 1))).toBe(true);
    });
  });
});
