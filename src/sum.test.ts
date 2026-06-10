import { describe, expect, it } from "vitest";

import { sum } from "./sum";

describe("sum", () => {
  it("returns 0 for an empty array", () => {
    expect(sum([])).toBe(0);
  });

  it("returns the single value for a one-element array", () => {
    expect(sum([7])).toBe(7);
  });

  it("returns the total of multiple values", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });
});
