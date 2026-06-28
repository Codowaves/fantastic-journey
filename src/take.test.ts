import { describe, expect, it } from "vitest";

import { take } from "./take";

describe("take", () => {
  it("returns the first n elements of an array", () => {
    expect(take([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
  });

  it("returns the whole array when n exceeds the length", () => {
    expect(take([1, 2], 5)).toEqual([1, 2]);
  });

  it("returns an empty array when n is zero", () => {
    expect(take([1, 2, 3], 0)).toEqual([]);
  });

  it("returns an empty array when n is negative", () => {
    expect(take([1, 2, 3], -1)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(take<number>([], 3)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    take(input, 2);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
