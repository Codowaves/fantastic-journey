import { describe, expect, it } from "vitest";

import { clamp } from "./num-utils";

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

  it("returns the value at the lower boundary", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns the value at the upper boundary", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-15, -10, -5)).toBe(-10);
  });

  it("handles floating point values", () => {
    expect(clamp(1.5, 0, 2)).toBe(1.5);
  });
});
