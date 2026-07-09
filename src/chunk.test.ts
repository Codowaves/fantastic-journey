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

  it("throws TypeError when arr is null or undefined", () => {
    expect(() => chunk(null as unknown as number[], 2)).toThrow(TypeError);
    expect(() => chunk(undefined as unknown as number[], 2)).toThrow(TypeError);
  });

  it("throws TypeError when size is null, undefined, or NaN", () => {
    expect(() => chunk([1, 2, 3], null as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => chunk([1, 2, 3], undefined as unknown as number)).toThrow(
      TypeError,
    );
    expect(() => chunk([1, 2, 3], Number.NaN)).toThrow(TypeError);
  });
});
