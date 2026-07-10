import { describe, expect, it } from "vitest";

import { lcm } from "./lcm";

describe("lcm", () => {
  it("returns 0 when either argument is 0", () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
  });

  it("returns the other value when one argument is 1", () => {
    expect(lcm(1, 7)).toBe(7);
    expect(lcm(7, 1)).toBe(7);
  });

  it("returns the product of two coprime numbers", () => {
    expect(lcm(4, 9)).toBe(36);
  });

  it("returns the larger value when one divides the other", () => {
    expect(lcm(6, 3)).toBe(6);
    expect(lcm(3, 6)).toBe(6);
  });

  it("computes the lcm of two equal numbers", () => {
    expect(lcm(8, 8)).toBe(8);
  });

  it("throws TypeError when either argument is null or undefined", () => {
    expect(() => lcm(null as unknown as number, 5)).toThrow(TypeError);
    expect(() => lcm(5, null as unknown as number)).toThrow(TypeError);
    expect(() => lcm(undefined as unknown as number, 5)).toThrow(TypeError);
    expect(() => lcm(5, undefined as unknown as number)).toThrow(TypeError);
  });

  it("throws TypeError when either argument is NaN", () => {
    expect(() => lcm(Number.NaN, 5)).toThrow(TypeError);
    expect(() => lcm(5, Number.NaN)).toThrow(TypeError);
  });

  it("returns 0 when both arguments are 0", () => {
    expect(lcm(0, 0)).toBe(0);
  });

  it("handles negative integers by mirroring the sign of the first argument", () => {
    expect(lcm(-4, 6)).toBe(-12);
    expect(lcm(4, -6)).toBe(12);
    expect(lcm(-4, -6)).toBe(-12);
  });

  it("returns the absolute value when negative divides positive", () => {
    expect(lcm(-12, 4)).toBe(-12);
    expect(lcm(12, -4)).toBe(12);
  });

  it("handles non-integer inputs by performing real-valued division", () => {
    expect(lcm(4.5, 3)).toBeCloseTo(9, 10);
    expect(lcm(2.5, 5)).toBeCloseTo(5, 10);
  });

  it("returns the first argument when it is 0 and the second is negative", () => {
    expect(lcm(0, -5)).toBe(0);
    expect(lcm(-5, 0)).toBe(0);
  });

  it("computes lcm for large equal powers of two", () => {
    expect(lcm(2 ** 40, 2 ** 40)).toBe(2 ** 40);
  });

  it("computes lcm for large coprime numbers via multi-step Euclidean reduction", () => {
    expect(lcm(9999991, 9999992)).toBe(9999991 * 9999992);
  });

  it("computes lcm for large non-coprime numbers", () => {
    expect(lcm(10 ** 9, 10 ** 9 - 1)).toBe(10 ** 9 * (10 ** 9 - 1));
  });

  it("handles small primes", () => {
    expect(lcm(2, 3)).toBe(6);
    expect(lcm(3, 5)).toBe(15);
    expect(lcm(5, 7)).toBe(35);
  });

  it("throws TypeError when both arguments are null", () => {
    expect(() =>
      lcm(null as unknown as number, null as unknown as number),
    ).toThrow(TypeError);
  });

  it("throws TypeError when both arguments are undefined", () => {
    expect(() =>
      lcm(undefined as unknown as number, undefined as unknown as number),
    ).toThrow(TypeError);
  });

  it("throws TypeError when both arguments are NaN", () => {
    expect(() => lcm(Number.NaN, Number.NaN)).toThrow(TypeError);
  });
});
