import { describe, expect, it } from "vitest";

import { lcm } from "./lcm";

describe("lcm", () => {
  it("returns 0 when either argument is 0", () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
  });

  it("returns 0 when both arguments are 0", () => {
    expect(lcm(0, 0)).toBe(0);
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

  it("handles negative arguments", () => {
    expect(lcm(-4, 6)).toBe(-12);
    expect(lcm(4, -6)).toBe(12);
    expect(lcm(-4, -6)).toBe(-12);
  });

  it("handles non-integer (float) arguments", () => {
    expect(lcm(4.5, 6)).toBe(18);
    expect(lcm(3, 2.5)).toBe(15);
  });

  it("handles very large numbers without overflow", () => {
    expect(lcm(1_000_000, 500_000)).toBe(1_000_000);
    expect(lcm(999_983, 999_979)).toBe(999_962_000_357);
  });

  it("returns a positive result for positive arguments", () => {
    expect(lcm(12, 18)).toBe(36);
  });

  it("is commutative for positive integers", () => {
    expect(lcm(12, 18)).toBe(lcm(18, 12));
  });
});
