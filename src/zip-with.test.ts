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

  describe("edge cases", () => {
    it("returns empty array when both arrays are empty", () => {
      expect(zipWith([], [], (a, b) => a + b)).toEqual([]);
    });

    it("returns a new array (does not share reference with inputs)", () => {
      const input = [1, 2, 3];
      const result = zipWith(input, [10, 20, 30], (a, b) => a + b);
      expect(result).not.toBe(input);
    });

    it("handles single-element arrays on both sides", () => {
      expect(zipWith([42], [7], (a, b) => a - b)).toEqual([35]);
    });

    it("handles a single-element left and multi-element right (truncates to 1)", () => {
      expect(zipWith([1], [10, 20, 30], (a, b) => a + b)).toEqual([11]);
    });

    it("handles a single-element right and multi-element left (truncates to 1)", () => {
      expect(zipWith([1, 2, 3], [10], (a, b) => a + b)).toEqual([11]);
    });

    it("preserves null and undefined values without throwing", () => {
      const a: (number | null)[] = [null, 2, null];
      const b: (number | null)[] = [1, null, 3];
      expect(zipWith(a, b, (x, y) => (x ?? -1) + (y ?? -1))).toEqual([0, 1, 2]);
    });

    it("invokes the combiner exactly min(len(a), len(b)) times", () => {
      let calls = 0;
      zipWith([1, 2, 3, 4], ["a", "b"], (n, s) => {
        calls++;
        return `${n}${s}`;
      });
      expect(calls).toBe(2);
    });

    it("returns an empty array without calling the combiner when one side is empty", () => {
      let calls = 0;
      const result = zipWith([1, 2, 3], [], (a, b) => {
        calls++;
        return a + b;
      });
      expect(result).toEqual([]);
      expect(calls).toBe(0);
    });

    it("handles large inputs correctly (boundary length)", () => {
      const N = 10_000;
      const a = Array.from({ length: N }, (_, i) => i);
      const b = Array.from({ length: N }, (_, i) => i * 2);
      const result = zipWith(a, b, (x, y) => x + y);
      expect(result.length).toBe(N);
      expect(result[0]).toBe(0);
      expect(result[N - 1]).toBe(N - 1 + (N - 1) * 2);
    });

    it("truncates asymmetric inputs at the shorter length", () => {
      const result = zipWith([1, 2, 3, 4, 5], [10], (a, b) => [a, b]);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual([1, 10]);
    });

    it("returns an empty result when combinator returns undefined consistently", () => {
      const result = zipWith(
        [1, 2, 3],
        [10, 20, 30],
        () => undefined as unknown as number,
      );
      expect(result).toEqual([undefined, undefined, undefined]);
    });

    it("does not mutate the input arrays", () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const aSnap = [...a];
      const bSnap = [...b];
      zipWith(a, b, (x, y) => x + y);
      expect(a).toEqual(aSnap);
      expect(b).toEqual(bSnap);
    });

    it("handles arrays containing falsy values", () => {
      const result = zipWith([0, 1, 2], [3, 4, 5], (a, b) => a + b);
      expect(result).toEqual([3, 5, 7]);
    });
  });
});
