import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns min when value is below the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns max when value is above the range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("throws RangeError when lo > hi", () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clamp(5, 10, 0)).toThrow("lo must be <= hi");
  });
});
