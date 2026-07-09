import { describe, expect, it } from "vitest";

import { runLength } from "./run-length";

describe("runLength", () => {
  it("encodes runs of equal adjacent numbers", () => {
    expect(runLength([1, 1, 2, 2, 2, 3, 1])).toEqual([
      [1, 2],
      [2, 3],
      [3, 1],
      [1, 1],
    ]);
  });

  it("encodes a single run covering the whole array", () => {
    expect(runLength(["a", "a", "a", "a"])).toEqual([["a", 4]]);
  });

  it("treats every item as its own run when no two adjacent items are equal", () => {
    expect(runLength([1, 2, 3, 4])).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(runLength<number>([])).toEqual([]);
  });

  it("returns a single pair with count 1 for a single-item input", () => {
    expect(runLength([42])).toEqual([[42, 1]]);
  });

  it("preserves the order of first-seen values", () => {
    expect(runLength([true, false, true, true, false])).toEqual([
      [true, 1],
      [false, 1],
      [true, 2],
      [false, 1],
    ]);
  });

  it("starts a new run when adjacent values switch from equal to not equal", () => {
    expect(runLength([1, 1, 1, 2, 2, 1, 1])).toEqual([
      [1, 3],
      [2, 2],
      [1, 2],
    ]);
  });

  it("treats NaN as not equal to itself, so each NaN is its own run", () => {
    expect(() => runLength([NaN, NaN, NaN])).toThrow(TypeError);
  });

  it("preserves object identity for distinct object references", () => {
    const a = {};
    const b = {};
    const result = runLength([a, a, b, a]);
    expect(result).toHaveLength(3);
    expect(result[0]?.[0]).toBe(a);
    expect(result[0]?.[1]).toBe(2);
    expect(result[1]?.[0]).toBe(b);
    expect(result[1]?.[1]).toBe(1);
    expect(result[2]?.[0]).toBe(a);
    expect(result[2]?.[1]).toBe(1);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    const snapshot = [...input];
    runLength(input);
    expect(input).toEqual(snapshot);
  });

  it("throws TypeError when input is null", () => {
    expect(() => runLength(null as unknown as number[])).toThrow(TypeError);
  });

  it("throws TypeError when input is undefined", () => {
    expect(() => runLength(undefined as unknown as number[])).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when input contains NaN", () => {
    expect(() => runLength([1, NaN, 3])).toThrow(TypeError);
  });
});
