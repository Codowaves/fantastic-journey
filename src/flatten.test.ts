import { describe, expect, it } from "vitest";

import { flatten } from "./flatten";

describe("flatten", () => {
  it("returns an empty array when given an empty array", () => {
    expect(flatten([])).toEqual([]);
  });

  it("returns the same elements when nothing is nested", () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("flattens nested arrays one level deep", () => {
    expect(flatten([1, [2, 3], [4], 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it("preserves element order from left to right", () => {
    expect(flatten([["a", "b"], "c", ["d"]])).toEqual(["a", "b", "c", "d"]);
  });

  it("does not flatten arrays nested more than one level", () => {
    expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, [3, 4], 5]);
  });

  it("drops empty nested arrays", () => {
    expect(flatten([1, [], 2, []])).toEqual([1, 2]);
  });

  it("returns an empty array when every element is an empty array", () => {
    expect(flatten([[], [], []])).toEqual([]);
  });

  it("preserves falsy elements", () => {
    expect(flatten([0, [false, ""], null, [undefined]])).toEqual([
      0,
      false,
      "",
      null,
      undefined,
    ]);
  });

  it("unwraps a single-element nested array", () => {
    expect(flatten([[42]])).toEqual([42]);
  });

  it("returns a new array rather than the input reference", () => {
    const input = [1, 2, 3];
    expect(flatten(input)).not.toBe(input);
  });

  it("does not mutate the input array", () => {
    const input = [1, [2, 3], 4];
    flatten(input);
    expect(input).toEqual([1, [2, 3], 4]);
  });

  it("throws TypeError when arr is null", () => {
    expect(() => flatten(null as unknown as number[])).toThrow(TypeError);
    expect(() => flatten(null as unknown as number[])).toThrow(
      "arr must be an array",
    );
  });

  it("throws TypeError when arr is undefined", () => {
    expect(() => flatten(undefined as unknown as number[])).toThrow(TypeError);
    expect(() => flatten(undefined as unknown as number[])).toThrow(
      "arr must be an array",
    );
  });

  it("throws TypeError when arr is NaN", () => {
    expect(() => flatten(NaN as unknown as number[])).toThrow(TypeError);
    expect(() => flatten(NaN as unknown as number[])).toThrow(
      "arr must be an array",
    );
  });
});
