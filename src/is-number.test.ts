import { describe, expect, it } from "vitest";

import { isNumber } from "./is-number";

describe("isNumber", () => {
  it("returns true for finite numbers", () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(42)).toBe(true);
    expect(isNumber(-3.14)).toBe(true);
  });

  it("returns false for NaN", () => {
    expect(isNumber(Number.NaN)).toBe(false);
  });

  it("returns false for Infinity and -Infinity", () => {
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false for non-number values", () => {
    expect(isNumber("hello")).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
  });
});
