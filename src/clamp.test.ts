import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns the value at the lower bound", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns the value at the upper bound", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("returns the min when value is below the range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("returns the max when value is above the range", () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});
