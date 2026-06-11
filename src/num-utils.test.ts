import { describe, expect, it } from "vitest";

import { clamp } from "./num-utils";

describe("clamp", () => {
  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(7.5, 5, 10)).toBe(7.5);
  });

  it("returns the minimum when the value is below the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(3, 5, 10)).toBe(5);
  });

  it("returns the maximum when the value is above the range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, 5, 10)).toBe(10);
  });

  it("returns the value when it equals the minimum bound", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns the value when it equals the maximum bound", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("handles ranges where min equals max", () => {
    expect(clamp(5, 7, 7)).toBe(7);
    expect(clamp(7, 7, 7)).toBe(7);
  });

  it("handles fractional numbers", () => {
    expect(clamp(2.5, 1.0, 3.0)).toBe(2.5);
    expect(clamp(0.5, 1.0, 3.0)).toBe(1.0);
    expect(clamp(3.5, 1.0, 3.0)).toBe(3.0);
  });
});
