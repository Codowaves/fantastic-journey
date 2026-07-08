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
    expect(() => chunk([1, 2, 3], Number.NaN)).toThrow(RangeError);
  });

  it("throws RangeError when size is Infinity", () => {
    expect(() => chunk([1, 2, 3], Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  it("handles a single-element input", () => {
    expect(chunk([42], 1)).toEqual([[42]]);
    expect(chunk([42], 5)).toEqual([[42]]);
  });

  it("splits when length is an exact multiple of size", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("preserves element types for string arrays", () => {
    expect(chunk(["a", "b", "c", "d"], 2)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("returns an empty array for empty input even at size 1", () => {
    expect(chunk<number>([], 1)).toEqual([]);
  });

  it("includes size in the RangeError message", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(/0/);
  });

  it("creates chunks that share no references with the original", () => {
    const input = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const result = chunk(input, 2);
    expect(result[0]![0]!).toBe(input[0]);
    result[0]!.push({ a: 99 });
    expect(input).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
  });
});
