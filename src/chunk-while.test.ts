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
});
