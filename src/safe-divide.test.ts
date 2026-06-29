import { describe, expect, it } from "vitest";

import { safeDivide } from "./safe-divide";

describe("safeDivide", () => {
  it("divides two positive numbers", () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it("returns a negative result when signs differ", () => {
    expect(safeDivide(-10, 2)).toBe(-5);
    expect(safeDivide(10, -2)).toBe(-5);
  });

  it("returns 0 when dividing 0 by a non-zero number", () => {
    expect(safeDivide(0, 5)).toBe(0);
  });

  it("returns 0 (not NaN/Infinity) when dividing by 0", () => {
    expect(safeDivide(10, 0)).toBe(0);
  });

  it("returns 0 when dividing 0 by 0", () => {
    expect(safeDivide(0, 0)).toBe(0);
  });

  it("handles floating-point division", () => {
    expect(safeDivide(1, 4)).toBe(0.25);
  });

  it("handles negative numbers on both sides", () => {
    expect(safeDivide(-10, -2)).toBe(5);
  });
});
