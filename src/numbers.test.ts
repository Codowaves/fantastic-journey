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

  it("returns false for non-integer numbers", () => {
    expect(isEven(1.5)).toBe(false);
    expect(isEven(2.1)).toBe(false);
    expect(isEven(-3.7)).toBe(false);
  });

  it("returns true for very large even integers", () => {
    expect(isEven(1_000_000)).toBe(true);
    expect(isEven(Number.MAX_SAFE_INTEGER - 1)).toBe(true);
  });

  it("returns false for very large odd integers", () => {
    expect(isEven(1_000_001)).toBe(false);
    expect(isEven(Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it("handles NaN and Infinity", () => {
    expect(isEven(Number.NaN)).toBe(false);
    expect(isEven(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isEven(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("returns false for non-number inputs", () => {
    expect(isEven(undefined as unknown as number)).toBe(false);
    expect(isEven(true as unknown as number)).toBe(false);
  });

  it("returns true for null because null coerces to 0", () => {
    expect(isEven(null as unknown as number)).toBe(true);
  });

  it("returns true for numeric strings because of numeric coercion", () => {
    expect(isEven("4" as unknown as number)).toBe(true);
    expect(isEven("5" as unknown as number)).toBe(false);
  });
});
