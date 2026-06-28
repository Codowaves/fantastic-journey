import { describe, expect, it } from "vitest";

import { factorial } from "./factorial";

describe("factorial", () => {
  it("returns 1 for 0", () => {
    expect(factorial(0)).toBe(1);
  });

  it("returns 1 for 1", () => {
    expect(factorial(1)).toBe(1);
  });

  it("computes 5! as 120", () => {
    expect(factorial(5)).toBe(120);
  });

  it("computes larger values correctly", () => {
    expect(factorial(10)).toBe(3628800);
  });

  it("throws on negative input", () => {
    expect(() => factorial(-1)).toThrow(RangeError);
  });
});
