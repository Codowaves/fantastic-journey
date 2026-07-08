import { describe, expect, it } from "vitest";

import { gcd } from "./gcd";

describe("gcd", () => {
  it("returns the larger value when one argument is zero", () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
  });

  it("returns the gcd of two coprime numbers", () => {
    expect(gcd(14, 15)).toBe(1);
  });

  it("returns the gcd of two numbers with a common factor", () => {
    expect(gcd(48, 18)).toBe(6);
  });

  it("handles equal inputs", () => {
    expect(gcd(12, 12)).toBe(12);
  });

  it("treats negative inputs as their absolute values", () => {
    expect(gcd(-48, 18)).toBe(6);
    expect(gcd(48, -18)).toBe(6);
  });

  it("treats both inputs negative as their absolute values", () => {
    expect(gcd(-48, -18)).toBe(6);
  });

  it("returns 0 when both arguments are zero", () => {
    // After normalization x = 0 and y = 0, the while loop is skipped, so x (0) is returned.
    expect(gcd(0, 0)).toBe(0);
  });

  it("truncates non-integer inputs before computing (the abs/trunc fallback branch)", () => {
    expect(gcd(7.4, 2.6)).toBe(1);
    expect(gcd(10.5, 4.5)).toBe(2);
  });

  it("treats negative non-integer inputs via the abs/trunc fallback branch", () => {
    expect(gcd(-7.4, 2.6)).toBe(1);
    expect(gcd(7.4, -2.6)).toBe(1);
  });

  it("exercises the loop body branch for multi-step Euclidean reductions", () => {
    // 100 and 36 require more than one iteration: 100 % 36 = 28, 36 % 28 = 8,
    // 28 % 8 = 4, 8 % 4 = 0.
    expect(gcd(100, 36)).toBe(4);
    expect(gcd(252, 105)).toBe(21);
  });

  it("returns 1 as the gcd when one argument is 1", () => {
    expect(gcd(1, 17)).toBe(1);
    expect(gcd(99, 1)).toBe(1);
    expect(gcd(1, 1)).toBe(1);
  });

  it("handles large numbers via repeated modulo reduction", () => {
    expect(gcd(1071, 462)).toBe(21);
    expect(gcd(123456, 7890)).toBe(6);
  });

  it("does not throw on well-defined edge inputs", () => {
    expect(() => gcd(0, 0)).not.toThrow();
    expect(() => gcd(-0, 0)).not.toThrow();
    expect(() => gcd(0, -0)).not.toThrow();
    expect(() => gcd(-0, -0)).not.toThrow();
  });

  it("returns the smaller argument when one divides the other exactly (single-iteration case)", () => {
    expect(gcd(10, 5)).toBe(5);
    expect(gcd(5, 10)).toBe(5);
    expect(gcd(100, 25)).toBe(25);
    expect(gcd(25, 100)).toBe(25);
  });

  it("returns 1 for two distinct prime numbers", () => {
    expect(gcd(17, 13)).toBe(1);
    expect(gcd(2, 3)).toBe(1);
    expect(gcd(101, 103)).toBe(1);
  });

  it("returns the smaller argument when it is the gcd (small a, large multiple b)", () => {
    expect(gcd(2, 4)).toBe(2);
    expect(gcd(3, 9)).toBe(3);
    expect(gcd(7, 14)).toBe(7);
  });

  it("handles fractional inputs that truncate to zero", () => {
    expect(gcd(0.5, 0)).toBe(0);
    expect(gcd(0, 0.5)).toBe(0);
    expect(gcd(5, 0.5)).toBe(5);
    expect(gcd(0.5, 5)).toBe(5);
    expect(gcd(-0.5, 5)).toBe(5);
    expect(gcd(0.5, -5)).toBe(5);
  });

  it("handles very large numbers via repeated modulo reduction", () => {
    expect(gcd(1e10, 1e9)).toBe(1000000000);
    expect(gcd(Number.MAX_SAFE_INTEGER, 1)).toBe(1);
  });

  it("returns the same result regardless of argument order", () => {
    expect(gcd(48, 18)).toBe(gcd(18, 48));
    expect(gcd(100, 36)).toBe(gcd(36, 100));
    expect(gcd(-48, 18)).toBe(gcd(18, -48));
  });

  it("handles negative inputs where the result exceeds the absolute smaller argument", () => {
    expect(gcd(-12, -12)).toBe(12);
    expect(gcd(-100, -36)).toBe(4);
  });

  it("treats whole-number floats as integers after truncation", () => {
    expect(gcd(1.0, 1.0)).toBe(1);
    expect(gcd(12.0, 18.0)).toBe(6);
    expect(gcd(-12.0, 18.0)).toBe(6);
  });
});
