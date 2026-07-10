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

  it("throws RangeError when size is NaN", () => {
    expect(() => chunk([1, 2, 3], NaN)).toThrow(RangeError);
  });

  it("throws RangeError when size is Infinity", () => {
    expect(() => chunk([1, 2, 3], Infinity)).toThrow(RangeError);
  });

  it("throws RangeError when size is negative Infinity", () => {
    expect(() => chunk([1, 2, 3], -Infinity)).toThrow(RangeError);
  });

  it("returns a single chunk of full length when size equals array length", () => {
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it("works with string elements (type polymorphism)", () => {
    expect(chunk(["a", "b", "c", "d", "e"], 2)).toEqual([
      ["a", "b"],
      ["c", "d"],
      ["e"],
    ]);
  });

  it("works with object elements (type polymorphism)", () => {
    const o1 = { id: 1 };
    const o2 = { id: 2 };
    const o3 = { id: 3 };
    expect(chunk([o1, o2, o3], 2)).toEqual([[o1, o2], [o3]]);
  });
});
