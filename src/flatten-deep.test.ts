import { describe, expect, it } from "vitest";

import { flattenDeep } from "./flatten-deep";

describe("flattenDeep", () => {
  it("returns a flat array unchanged", () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("flattens nested arrays one level at a time", () => {
    expect(flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenDeep([])).toEqual([]);
  });

  it("returns a non-array input as-is", () => {
    expect(flattenDeep(42)).toBe(42);
  });
});
