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

  it("returns a single-element result for length-1 inputs", () => {
    const result = zipWith([7], [3], (a, b) => a - b);
    expect(result).toEqual([4]);
  });

  it("returns an empty array when both inputs are empty", () => {
    const result = zipWith<number, number, number>([], [], (a, b) => a + b);
    expect(result).toEqual([]);
  });

  it("preserves undefined slots from a sparse first array", () => {
    const a: Array<number | undefined> = [1, , 3];
    const result = zipWith(a, [10, 20, 30], (x, y) =>
      x === undefined ? y * 10 : x + y,
    );
    expect(result).toEqual([11, 200, 33]);
  });

  it("preserves undefined slots from a sparse second array", () => {
    const b: Array<number | undefined> = [10, , 30];
    const result = zipWith([1, 2, 3], b, (x, y) =>
      y === undefined ? x * 10 : x + y,
    );
    expect(result).toEqual([11, 20, 33]);
  });

  it("propagates errors thrown from the combinator", () => {
    expect(() =>
      zipWith([1, 2, 3], [4, 5, 6], () => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
  });

  it("does not mutate the input arrays", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    zipWith(a, b, (x, y) => x + y);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([4, 5, 6]);
  });

  it("returns a new array even when the result type matches the inputs", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const result = zipWith(a, b, (x, y) => x + y);
    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
  });

  it("throws TypeError when the first array is null", () => {
    expect(() =>
      zipWith(null as unknown as number[], [1, 2], (x, y) => x + y),
    ).toThrow(TypeError);
  });

  it("throws TypeError when the first array is undefined", () => {
    expect(() =>
      zipWith(undefined as unknown as number[], [1, 2], (x, y) => x + y),
    ).toThrow(TypeError);
  });

  it("throws TypeError when the second array is null", () => {
    expect(() =>
      zipWith([1, 2], null as unknown as number[], (x, y) => x + y),
    ).toThrow(TypeError);
  });

  it("throws TypeError when the second array is undefined", () => {
    expect(() =>
      zipWith([1, 2], undefined as unknown as number[], (x, y) => x + y),
    ).toThrow(TypeError);
  });

  it("throws TypeError when the combinator is not a function", () => {
    expect(() =>
      zipWith(
        [1, 2],
        [3, 4],
        42 as unknown as (a: number, b: number) => number,
      ),
    ).toThrow(TypeError);
  });

  it("throws TypeError when the combinator is undefined", () => {
    expect(() =>
      zipWith(
        [1, 2],
        [3, 4],
        undefined as unknown as (a: number, b: number) => number,
      ),
    ).toThrow(TypeError);
  });
});
