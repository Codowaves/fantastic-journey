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
});
