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
});
