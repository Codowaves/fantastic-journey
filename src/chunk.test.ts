import { describe, expect, it } from "vitest";

import { chunk } from "./chunk";

describe("chunk", () => {
  it("splits an array into evenly-sized chunks", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("keeps a shorter final chunk when the length is not a multiple of size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns an empty array for empty input", () => {
    expect(chunk<number>([], 3)).toEqual([]);
  });

  it("produces single-element chunks when size is 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("returns a single chunk shorter than size when size exceeds the array", () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  it("throws RangeError when size is zero", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
  });

  it("throws RangeError when size is negative", () => {
    expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
  });

  it("throws RangeError when size is not an integer", () => {
    expect(() => chunk([1, 2, 3], 1.5)).toThrow(RangeError);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    chunk(input, 2);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  describe("size validation (RangeError branch)", () => {
    it("throws RangeError when size is NaN", () => {
      expect(() => chunk([1, 2, 3], Number.NaN)).toThrow(RangeError);
    });

    it("throws RangeError when size is Infinity", () => {
      expect(() => chunk([1, 2, 3], Infinity)).toThrow(RangeError);
    });

    it("throws RangeError when size is -Infinity", () => {
      expect(() => chunk([1, 2, 3], -Infinity)).toThrow(RangeError);
    });

    it("throws RangeError when size is a negative fraction", () => {
      expect(() => chunk([1, 2, 3], -1.5)).toThrow(RangeError);
    });

    it("throws RangeError when size is a positive fraction", () => {
      expect(() => chunk([1, 2, 3], 2.5)).toThrow(RangeError);
    });

    it("includes the offending value in the error message for zero", () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow(/0/);
    });

    it("includes the offending value in the error message for a negative size", () => {
      expect(() => chunk([1, 2, 3], -7)).toThrow(/-7/);
    });

    it("includes the offending value in the error message for a fractional size", () => {
      expect(() => chunk([1, 2, 3], 1.25)).toThrow(/1\.25/);
    });

    it("throws even when the array is empty and size is invalid", () => {
      expect(() => chunk<number>([], 0)).toThrow(RangeError);
      expect(() => chunk<number>([], -1)).toThrow(RangeError);
      expect(() => chunk<number>([], 1.5)).toThrow(RangeError);
      expect(() => chunk<number>([], NaN)).toThrow(RangeError);
    });

    it("does not produce a result when the validation throws", () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
      expect(() => chunk([1, 2, 3], NaN)).toThrow(RangeError);
    });
  });

  describe("fallback branches", () => {
    it("returns an empty array when the input is empty (size still validated)", () => {
      expect(chunk<number>([], 1)).toEqual([]);
      expect(chunk<number>([], 100)).toEqual([]);
    });

    it("returns a single full-length chunk when size exactly equals array length", () => {
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    it("handles a single-element array", () => {
      expect(chunk([42], 1)).toEqual([[42]]);
      expect(chunk([42], 5)).toEqual([[42]]);
    });

    it("does not throw when chunking an empty array with a valid size", () => {
      expect(() => chunk<number>([], 1)).not.toThrow();
      expect(() => chunk<number>([], 99)).not.toThrow();
    });
  });

  describe("non-mutation guarantees", () => {
    it("does not mutate the input array when validation throws", () => {
      const input = [1, 2, 3, 4, 5];
      expect(() => chunk(input, -1)).toThrow(RangeError);
      expect(input).toEqual([1, 2, 3, 4, 5]);
    });

    it("does not mutate a frozen input array", () => {
      const frozen = Object.freeze([1, 2, 3, 4]) as number[];
      expect(() => chunk(frozen, 2)).not.toThrow();
      expect(chunk(frozen, 2)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("preserves the identity of nested objects across chunks", () => {
      const a = { id: 1 };
      const b = { id: 2 };
      const result = chunk([a, b], 1);
      expect(result).toEqual([[a], [b]]);
      expect(result[0]?.[0]).toBe(a);
      expect(result[1]?.[0]).toBe(b);
    });
  });
});
