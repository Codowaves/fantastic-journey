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

  it("preserves falsy primitive values like 0, false, and empty string", () => {
    expect(flatten([0, [false, ""], null])).toEqual([0, false, "", null]);
  });

  it("drops nested empty arrays without leaving undefined holes", () => {
    expect(flatten([1, [], [2], [], 3])).toEqual([1, 2, 3]);
  });

  it("flattens an array consisting only of nested empty arrays", () => {
    expect(flatten([[], [], []])).toEqual([]);
  });

  it("flattens when every element is itself a nested array", () => {
    expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it("preserves null and undefined values inside the array", () => {
    expect(flatten([null, [undefined, null], undefined])).toEqual([
      null,
      undefined,
      null,
      undefined,
    ]);
  });

  it("flattens single-element nested arrays", () => {
    expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
  });

  it("returns a new array instance rather than mutating the input", () => {
    const input: (number | number[])[] = [1, [2, 3]];
    const output = flatten(input);
    expect(output).not.toBe(input);
    expect(input).toEqual([1, [2, 3]]);
    expect(output).toEqual([1, 2, 3]);
  });

  it("treats arrays-of-arrays with no leaf scalars as still valid input", () => {
    expect(flatten([[], [[]], []])).toEqual([[]]);
  });

  it("does not coerce boolean false input into a valid array", () => {
    expect(() => flatten(false as unknown as number[])).toThrow(TypeError);
  });
});
