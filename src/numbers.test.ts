import { describe, expect, it } from "vitest";

import { isEven } from "./numbers";

describe("isEven", () => {
  it("returns true for even positive integers", () => {
    expect(isEven(2)).toBe(true);
  });

  it("returns false for odd positive integers", () => {
    expect(isEven(3)).toBe(false);
  });

  it("returns true for zero", () => {
    expect(isEven(0)).toBe(true);
  });

  it("returns true for negative even integers", () => {
    expect(isEven(-4)).toBe(true);
  });

  it("returns false for negative odd integers", () => {
    expect(isEven(-7)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isEven(Number.NaN)).toBe(false);
  });

  it("returns false for positive Infinity", () => {
    expect(isEven(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("returns false for negative Infinity", () => {
    expect(isEven(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false for non-integer finite floats (even .5)", () => {
    expect(isEven(2.5)).toBe(false);
  });

  it("returns false for non-integer finite floats (odd .5)", () => {
    expect(isEven(3.5)).toBe(false);
  });

  it("returns true for Number.MAX_SAFE_INTEGER (odd) being odd", () => {
    expect(isEven(Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it("returns true for Number.MAX_SAFE_INTEGER - 1 (even boundary)", () => {
    expect(isEven(Number.MAX_SAFE_INTEGER - 1)).toBe(true);
  });

  it("returns false for negative even .5", () => {
    expect(isEven(-2.5)).toBe(false);
  });
});
