import { describe, expect, it } from "vitest";

import { euclidean, manhattan } from "./distance";

describe("euclidean", () => {
  it("returns 0 for identical points", () => {
    expect(euclidean(3, 4, 3, 4)).toBe(0);
  });

  it("computes the diagonal distance between axis-aligned points", () => {
    expect(euclidean(0, 0, 3, 4)).toBe(5);
  });

  it("handles negative coordinates", () => {
    expect(euclidean(-1, -1, 2, 3)).toBe(5);
  });

  it("is symmetric", () => {
    expect(euclidean(1, 2, 4, 6)).toBe(euclidean(4, 6, 1, 2));
  });
});

describe("manhattan", () => {
  it("returns 0 for identical points", () => {
    expect(manhattan(3, 4, 3, 4)).toBe(0);
  });

  it("sums absolute differences along each axis", () => {
    expect(manhattan(0, 0, 3, 4)).toBe(7);
  });

  it("handles negative coordinates", () => {
    expect(manhattan(-1, -1, 2, 3)).toBe(7);
  });

  it("is symmetric", () => {
    expect(manhattan(1, 2, 4, 6)).toBe(manhattan(4, 6, 1, 2));
  });
});
