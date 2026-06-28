import { describe, expect, it } from "vitest";

import { isEmptyValue } from "./is-empty-value";

describe("isEmptyValue", () => {
  it("returns true for null", () => {
    expect(isEmptyValue(null)).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(isEmptyValue(undefined)).toBe(true);
  });

  it("returns true for an empty string", () => {
    expect(isEmptyValue("")).toBe(true);
  });

  it("returns true for an empty array", () => {
    expect(isEmptyValue([])).toBe(true);
  });

  it("returns true for an empty object", () => {
    expect(isEmptyValue({})).toBe(true);
  });

  it("returns false for a non-empty string", () => {
    expect(isEmptyValue("hello")).toBe(false);
  });

  it("returns false for a non-empty array", () => {
    expect(isEmptyValue([1, 2, 3])).toBe(false);
  });

  it("returns false for a non-empty object", () => {
    expect(isEmptyValue({ a: 1 })).toBe(false);
  });

  it("returns false for primitive numbers", () => {
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(42)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue(true)).toBe(false);
  });
});
