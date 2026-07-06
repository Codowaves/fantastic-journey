import { describe, expect, it } from "vitest";

import { flattenDeep } from "./flatten-deep";

describe("flattenDeep", () => {
  it("flattens deeply nested arrays to a single level", () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenDeep([])).toEqual([]);
  });

  it("returns a flat array unchanged", () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("flattens arrays nested at varying depths", () => {
    expect(flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it("preserves element order from left to right", () => {
    expect(flattenDeep([["a", ["b"]], "c", [["d"]]])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("throws a TypeError when given a non-array input", () => {
    expect(() => flattenDeep(42 as unknown as unknown[])).toThrow(TypeError);
    expect(() => flattenDeep("not an array" as unknown as unknown[])).toThrow(
      TypeError,
    );
    expect(() => flattenDeep(null as unknown as unknown[])).toThrow(TypeError);
  });
});
