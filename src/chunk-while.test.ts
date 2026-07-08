import { describe, expect, it } from "vitest";

import { chunkWhile } from "./chunk-while";

describe("chunkWhile", () => {
  it("groups consecutive runs of equal numbers", () => {
    expect(chunkWhile([1, 1, 2, 2, 2, 3, 1], (a, b) => a === b)).toEqual([
      [1, 1],
      [2, 2, 2],
      [3],
      [1],
    ]);
  });

  it("groups ascending runs while the next value is greater than the previous", () => {
    expect(chunkWhile([1, 2, 3, 2, 3, 4, 5, 1], (a, b) => a < b)).toEqual([
      [1, 2, 3],
      [2, 3, 4, 5],
      [1],
    ]);
  });

  it("treats every adjacent pair as a boundary when pred is always false", () => {
    expect(chunkWhile([1, 2, 3], () => false)).toEqual([[1], [2], [3]]);
  });

  it("returns a single chunk when pred is always true", () => {
    expect(chunkWhile([1, 2, 3, 4], () => true)).toEqual([[1, 2, 3, 4]]);
  });

  it("returns an empty array for an empty input", () => {
    expect(chunkWhile<number>([], () => true)).toEqual([]);
  });

  it("returns a single-element chunk for a single-item input", () => {
    expect(chunkWhile([42], () => true)).toEqual([[42]]);
  });

  it("keeps falsy values when they appear at chunk boundaries", () => {
    expect(
      chunkWhile([0, 0, false, false, "", ""], (a, b) => Object.is(a, b)),
    ).toEqual([
      [0, 0],
      [false, false],
      ["", ""],
    ]);
  });

  it("returns two single-element chunks for a two-item input when pred is false", () => {
    expect(chunkWhile([1, 2], (a, b) => a === b)).toEqual([[1], [2]]);
  });

  it("returns one two-element chunk for a two-item input when pred is true", () => {
    expect(chunkWhile([1, 1], (a, b) => a === b)).toEqual([[1, 1]]);
  });

  it("chunks strings by prefix match", () => {
    expect(
      chunkWhile(
        ["apple", "apricot", "banana", "blueberry", "cherry"],
        (a, b) => a[0] === b[0],
      ),
    ).toEqual([["apple", "apricot"], ["banana", "blueberry"], ["cherry"]]);
  });

  it("chunks objects by reference identity, not structural equality", () => {
    const a = { id: 1 };
    const b = { id: 1 };
    expect(chunkWhile([a, b], (x, y) => x === y)).toEqual([[a], [b]]);
  });

  it("handles a final chunk after a boundary at the end", () => {
    expect(chunkWhile([1, 1, 2], (a, b) => a === b)).toEqual([[1, 1], [2]]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    chunkWhile(input, (a, b) => a === b);
    expect(input).toEqual([1, 1, 2, 2, 3]);
  });

  it("throws TypeError when the input is not array-like", () => {
    expect(() =>
      chunkWhile(null as unknown as readonly number[], () => true),
    ).toThrow(TypeError);
  });

  it("throws TypeError when pred is not a function", () => {
    expect(() =>
      chunkWhile(
        [1, 2],
        null as unknown as (prev: number, next: number) => boolean,
      ),
    ).toThrow(TypeError);
  });
});
