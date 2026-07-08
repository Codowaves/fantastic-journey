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

  it("returns true for whole-valued floats that are even", () => {
    expect(isEven(4.0)).toBe(true);
  });

  it("returns false for whole-valued floats that are odd", () => {
    expect(isEven(3.0)).toBe(false);
  });

  it("returns false for non-integer floats", () => {
    expect(isEven(2.5)).toBe(false);
    expect(isEven(-1.5)).toBe(false);
  });

  it("returns true for Number.MAX_SAFE_INTEGER when even", () => {
    expect(isEven(Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it("returns true for Number.MAX_SAFE_INTEGER minus 1 when odd", () => {
    expect(isEven(Number.MAX_SAFE_INTEGER - 1)).toBe(true);
  });

  it("returns true for large negative even numbers", () => {
    expect(isEven(-1e10)).toBe(true);
  });

  it("returns false for large negative odd numbers", () => {
    expect(isEven(-1e10 - 1)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isEven(NaN)).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(isEven(Infinity)).toBe(false);
  });

  it("returns false for negative Infinity", () => {
    expect(isEven(-Infinity)).toBe(false);
  });
});
