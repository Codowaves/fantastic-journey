import { describe, expect, it } from "vitest";

import { mean } from "./mean";

describe("mean", () => {
  it("returns 0 for an empty array", () => {
    expect(mean([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(mean([7])).toBe(7);
  });

  it("returns the arithmetic mean of multiple values", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });

  it("returns 0 when all values are 0", () => {
    expect(mean([0, 0, 0])).toBe(0);
  });
});
