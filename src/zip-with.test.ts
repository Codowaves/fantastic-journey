import { describe, it, expect, vi } from "vitest";
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

  describe("edge cases", () => {
    it("returns empty array when both inputs are empty", () => {
      const result = zipWith<number, number, number>([], [], (a, b) => a + b);
      expect(result).toEqual([]);
    });

    it("handles single-element arrays", () => {
      const result = zipWith([7], [3], (a, b) => a - b);
      expect(result).toEqual([4]);
    });

    it("does not invoke the combinator when either input is empty", () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      zipWith([], [1, 2, 3], fn);
      zipWith([1, 2, 3], [], fn);
      expect(fn).not.toHaveBeenCalled();
    });

    it("truncates a length-1 first array against a longer second array", () => {
      const result = zipWith([1], ["x", "y", "z"], (n, s) => `${n}${s}`);
      expect(result).toEqual(["1x"]);
    });

    it("truncates a length-1 second array against a longer first array", () => {
      const result = zipWith([1, 2, 3], [9], (a, b) => a + b);
      expect(result).toEqual([10]);
    });

    it("preserves a zero value at a truncated index", () => {
      const result = zipWith([0, 5, 10], [1], (a, b) => a + b);
      expect(result).toEqual([1]);
    });

    it("preserves falsy values from the inputs in the result", () => {
      const result = zipWith(
        [0, null, false, ""],
        [0, null, false, ""],
        (a, b) => ({ a, b }),
      );
      expect(result).toEqual([
        { a: 0, b: 0 },
        { a: null, b: null },
        { a: false, b: false },
        { a: "", b: "" },
      ]);
    });

    it("passes through undefined elements when present in the inputs", () => {
      const a: (number | undefined)[] = [1, undefined, 3];
      const b: (number | undefined)[] = [10, 20, undefined];
      const result = zipWith(a, b, (x, y) => [x, y] as const);
      expect(result).toEqual([
        [1, 10],
        [undefined, 20],
        [3, undefined],
      ]);
    });

    it("does not mutate either input array", () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      zipWith(a, b, (x, y) => x + y);
      expect(a).toEqual([1, 2, 3]);
      expect(b).toEqual([4, 5, 6]);
    });

    it("invokes the combinator exactly once per shared index", () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const result = zipWith([1, 2, 3, 4], [10, 20], fn);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(result).toEqual([11, 22]);
    });

    it("supports zero-length shared region when one array is empty", () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const result = zipWith([], [], fn);
      expect(fn).toHaveBeenCalledTimes(0);
      expect(result).toEqual([]);
    });
  });
});
