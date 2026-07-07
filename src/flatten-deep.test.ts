import { describe, expect, it } from "vitest";

import { flattenDeep } from "./flatten-deep";

describe("flattenDeep", () => {
  it("returns a flat array unchanged", () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("recursively flattens deeply nested arrays", () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenDeep([])).toEqual([]);
  });

  it("throws a TypeError for non-array top-level input", () => {
    expect(() => flattenDeep(42 as unknown as unknown[])).toThrow(TypeError);
  });
});
