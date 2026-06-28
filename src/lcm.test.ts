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
});
