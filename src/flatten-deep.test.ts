import { describe, expect, it } from "vitest";

import { flattenDeep } from "./flatten-deep";

describe("flattenDeep", () => {
  it("returns an empty array for an empty array", () => {
    expect(flattenDeep([])).toEqual([]);
  });

  it("flattens a deeply nested array", () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it("handles arrays with mixed nesting levels", () => {
    expect(flattenDeep([1, 2, [3, 4], [5, [6, 7]]])).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("handles single-level arrays", () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("throws TypeError for non-array input", () => {
    expect(() => flattenDeep(123 as any)).toThrow(TypeError);
    expect(() => flattenDeep("string" as any)).toThrow(TypeError);
    expect(() => flattenDeep(null as any)).toThrow(TypeError);
  });

  it("handles arrays with different types", () => {
    expect(flattenDeep(["a", ["b", ["c", "d"]]])).toEqual(["a", "b", "c", "d"]);
  });

  it("handles deeply nested empty arrays", () => {
    expect(flattenDeep([[], [[]], [[[]]]])).toEqual([]);
  });
});
