import { describe, expect, it } from "vitest";

import { mode } from "./mode";

describe("mode", () => {
  it("returns undefined for an empty array", () => {
    expect(mode([])).toBeUndefined();
  });

  it("throws TypeError when nums is null", () => {
    expect(() => mode(null as unknown as number[])).toThrow(TypeError);
  });

  it("throws TypeError when nums is undefined", () => {
    expect(() => mode(undefined as unknown as number[])).toThrow(TypeError);
  });

  it("returns the single value for a one-element array", () => {
    expect(mode([7])).toBe(7);
  });

  it("returns the most frequent value", () => {
    expect(mode([1, 2, 2, 3, 3, 3, 4])).toBe(3);
  });

  it("returns the first value seen on a tie", () => {
    expect(mode([1, 1, 2, 2, 3])).toBe(1);
  });
});
