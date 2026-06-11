import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns min when value is below the range", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns max when value is above the range", () => {
    expect(clamp(99, 0, 10)).toBe(10);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("throws RangeError when min > max", () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clamp(5, 10, 0)).toThrow(
      "Invalid range: min (10) cannot be greater than max (0)",
    );
  });

  it("handles NaN correctly", () => {
    expect(clamp(NaN, 0, 10)).toBe(NaN);
    expect(clamp(5, NaN, 10)).toBe(NaN);
    expect(clamp(5, 0, NaN)).toBe(NaN);
  });
});
