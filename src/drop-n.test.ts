import { describe, expect, it } from "vitest";

import { dropN } from "./drop-n";

describe("dropN", () => {
  it("drops the first n elements from the array", () => {
    expect(dropN([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5]);
  });

  it("returns the full array when n is zero", () => {
    expect(dropN([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });

  it("returns an empty array when n equals the array length", () => {
    expect(dropN([1, 2, 3], 3)).toEqual([]);
  });

  it("returns an empty array when n exceeds the array length", () => {
    expect(dropN([1, 2, 3], 10)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(dropN<number>([], 0)).toEqual([]);
    expect(dropN<number>([], 5)).toEqual([]);
  });

  it("preserves element types for non-number arrays", () => {
    const input = ["a", "b", "c", "d"];
    expect(dropN(input, 1)).toEqual(["b", "c", "d"]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4];
    dropN(input, 2);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  describe("error paths", () => {
    it("throws RangeError when n is negative", () => {
      expect(() => dropN([1, 2, 3], -1)).toThrow(RangeError);
    });

    it("throws RangeError when n is a large negative integer", () => {
      expect(() => dropN([1, 2, 3], -100)).toThrow(RangeError);
    });

    it("throws RangeError when n is not an integer (float)", () => {
      expect(() => dropN([1, 2, 3], 1.5)).toThrow(RangeError);
    });

    it("throws RangeError when n is a small fractional value just above zero", () => {
      expect(() => dropN([1, 2, 3], 0.1)).toThrow(RangeError);
    });

    it("throws RangeError when n is NaN", () => {
      expect(() => dropN([1, 2, 3], Number.NaN)).toThrow(RangeError);
    });

    it("throws RangeError when n is positive Infinity", () => {
      expect(() => dropN([1, 2, 3], Number.POSITIVE_INFINITY)).toThrow(
        RangeError,
      );
    });

    it("throws RangeError when n is negative Infinity", () => {
      expect(() => dropN([1, 2, 3], Number.NEGATIVE_INFINITY)).toThrow(
        RangeError,
      );
    });

    it("throws RangeError when n is a numeric string", () => {
      expect(() => dropN([1, 2, 3], "2" as unknown as number)).toThrow(
        RangeError,
      );
    });

    it("throws RangeError when n is null", () => {
      expect(() => dropN([1, 2, 3], null as unknown as number)).toThrow(
        RangeError,
      );
    });

    it("throws RangeError when n is undefined", () => {
      expect(() => dropN([1, 2, 3], undefined as unknown as number)).toThrow(
        RangeError,
      );
    });

    it("throws even when the input array is empty", () => {
      expect(() => dropN([], -1)).toThrow(RangeError);
      expect(() => dropN([], 1.5)).toThrow(RangeError);
      expect(() => dropN([], Number.NaN)).toThrow(RangeError);
    });

    it("includes the invalid value in the error message", () => {
      expect(() => dropN([1, 2, 3], -1)).toThrow(/-1/);
      expect(() => dropN([1, 2, 3], 1.5)).toThrow(/1\.5/);
    });

    it("does not mutate the input array before throwing", () => {
      const input = [1, 2, 3, 4];
      expect(() => dropN(input, -1)).toThrow(RangeError);
      expect(input).toEqual([1, 2, 3, 4]);
    });
  });
});
