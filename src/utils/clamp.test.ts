import { describe, expect, it } from "vitest";

import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns the value unchanged when it is within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when the value is below range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("returns max when the value is above range", () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it.each([
    { n: 5, min: 0, max: 10, expected: 5 },
    { n: 0, min: 0, max: 10, expected: 0 },
    { n: 10, min: 0, max: 10, expected: 10 },
    { n: -1, min: 0, max: 10, expected: 0 },
    { n: 11, min: 0, max: 10, expected: 10 },
    { n: -5, min: -10, max: -1, expected: -5 },
    { n: -20, min: -10, max: -1, expected: -10 },
    { n: 0, min: -10, max: -1, expected: -1 },
    { n: 1.5, min: 0, max: 1, expected: 1 },
    { n: 0.25, min: 0, max: 1, expected: 0.25 },
  ])("clamps $n to [$min, $max] yielding $expected", ({ n, min, max, expected }) => {
    expect(clamp(n, min, max)).toBe(expected);
  });
});
