import { describe, expect, it } from "vitest";

import { unique } from "./array-utils";

describe("unique", () => {
  it("returns a new array with duplicates removed, preserving first-occurrence order", () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array when given an empty array", () => {
    expect(unique([])).toEqual([]);
  });

  it("returns a copy with the same elements when the input has no duplicates", () => {
    const input = [1, 2, 3];
    const result = unique(input);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(input);
  });

  it("treats distinct object references as unique entries", () => {
    const a = { x: 1 };
    const b = { x: 1 };
    expect(unique([a, b])).toEqual([a, b]);
  });

  it("collapses repeated references to the same object into a single entry", () => {
    const a = { x: 1 };
    expect(unique([a, a, a])).toEqual([a]);
  });
});
