import { describe, expect, it } from "vitest";

import { clamp } from "./num-utils";

describe("clamp", () => {
  it("returns the value when it lies within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when the value is below the range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("returns max when the value is above the range", () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("returns the bound itself when the value equals min or max", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-20, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});
