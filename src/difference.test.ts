import { describe, expect, it } from "vitest";

import { difference } from "./difference";

describe("difference", () => {
  it("returns values in a that are not in b", () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });

  it("returns an empty array when b contains every element of a", () => {
    expect(difference([1, 2, 3], [1, 2, 3])).toEqual([]);
  });

  it("returns a copy of a when b is empty", () => {
    expect(difference([1, 2, 3], [])).toEqual([1, 2, 3]);
  });

  it("returns an empty array when both inputs are empty", () => {
    expect(difference([], [])).toEqual([]);
  });

  it("preserves the order of the first array", () => {
    expect(difference([3, 1, 4, 1, 5], [1])).toEqual([3, 4, 5]);
  });

  it("works with string values", () => {
    expect(difference(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
  });

  it("ignores duplicates already present in a (returns first occurrence)", () => {
    expect(difference([1, 2, 2, 3, 1], [3])).toEqual([1, 2, 2, 1]);
  });

  it("does not mutate either input array", () => {
    const a = [1, 2, 3];
    const b = [2];
    difference(a, b);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([2]);
  });

  it("throws TypeError when a is null", () => {
    expect(() => difference(null as unknown as number[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => difference(null as unknown as number[], [1, 2])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when a is undefined", () => {
    expect(() => difference(undefined as unknown as number[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => difference(undefined as unknown as number[], [1, 2])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when b is null", () => {
    expect(() => difference([1, 2, 3], null as unknown as number[])).toThrow(
      TypeError,
    );
    expect(() => difference([1, 2, 3], null as unknown as number[])).toThrow(
      "b must be an array",
    );
  });

  it("throws TypeError when b is undefined", () => {
    expect(() =>
      difference([1, 2, 3], undefined as unknown as number[]),
    ).toThrow(TypeError);
    expect(() =>
      difference([1, 2, 3], undefined as unknown as number[]),
    ).toThrow("b must be an array");
  });

  it("throws TypeError when a is NaN", () => {
    expect(() => difference(NaN as unknown as number[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => difference(NaN as unknown as number[], [1, 2])).toThrow(
      "a must be an array",
    );
  });

  it("throws TypeError when b is NaN", () => {
    expect(() => difference([1, 2, 3], NaN as unknown as number[])).toThrow(
      TypeError,
    );
    expect(() => difference([1, 2, 3], NaN as unknown as number[])).toThrow(
      "b must be an array",
    );
  });
});
