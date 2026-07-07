import { describe, expect, it } from "vitest";

import { euclidean, manhattan } from "./index";

describe("geo/euclidean", () => {
  it("returns 0 for identical points", () => {
    expect(euclidean(3, 4, 3, 4)).toBe(0);
  });

  it("computes the diagonal distance between axis-aligned points", () => {
    expect(euclidean(0, 0, 3, 4)).toBe(5);
  });

  it("throws TypeError when ax is null", () => {
    // @ts-expect-error - intentionally passing null to test runtime guard
    expect(() => euclidean(null, 0, 1, 1)).toThrow(TypeError);
  });

  it("throws TypeError when ay is undefined", () => {
    // @ts-expect-error - intentionally passing undefined to test runtime guard
    expect(() => euclidean(0, undefined, 1, 1)).toThrow(TypeError);
  });

  it("throws TypeError when bx is NaN", () => {
    expect(() => euclidean(0, 0, NaN, 1)).toThrow(TypeError);
  });

  it("throws TypeError when by is NaN", () => {
    expect(() => euclidean(0, 0, 1, NaN)).toThrow(TypeError);
  });
});

describe("geo/manhattan", () => {
  it("returns 0 for identical points", () => {
    expect(manhattan(3, 4, 3, 4)).toBe(0);
  });

  it("sums absolute differences along each axis", () => {
    expect(manhattan(0, 0, 3, 4)).toBe(7);
  });

  it("throws TypeError when ax is null", () => {
    // @ts-expect-error - intentionally passing null to test runtime guard
    expect(() => manhattan(null, 0, 1, 1)).toThrow(TypeError);
  });

  it("throws TypeError when by is undefined", () => {
    // @ts-expect-error - intentionally passing undefined to test runtime guard
    expect(() => manhattan(0, 0, 1, undefined)).toThrow(TypeError);
  });

  it("throws TypeError when ax is NaN", () => {
    expect(() => manhattan(NaN, 0, 1, 1)).toThrow(TypeError);
  });
});
