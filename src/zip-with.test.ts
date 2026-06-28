import { describe, it, expect } from "vitest";
import { zipWith } from "./zip-with";

describe("zipWith", () => {
  it("combines two arrays elementwise using the provided function", () => {
    const result = zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b);
    expect(result).toEqual([5, 7, 9]);
  });

  it("truncates to the shorter array when first is longer", () => {
    const result = zipWith([1, 2, 3, 4], [10, 20], (a, b) => a * b);
    expect(result).toEqual([10, 40]);
  });

  it("truncates to the shorter array when second is longer", () => {
    const result = zipWith([1, 2], ["a", "b", "c", "d"], (n, s) => `${n}${s}`);
    expect(result).toEqual(["1a", "2b"]);
  });

  it("returns empty array when first array is empty", () => {
    const result = zipWith<number, number, number>(
      [],
      [1, 2, 3],
      (a, b) => a + b,
    );
    expect(result).toEqual([]);
  });

  it("returns empty array when second array is empty", () => {
    const result = zipWith([1, 2, 3], [], (a, b) => a + b);
    expect(result).toEqual([]);
  });

  it("supports changing the result type via the combinator", () => {
    const result = zipWith([1, 2, 3], [10, 20, 30], (a, b) => `${a + b}`);
    expect(result).toEqual(["11", "22", "33"]);
  });
});
