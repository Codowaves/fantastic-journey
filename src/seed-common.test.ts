import { describe, it, expect } from "vitest";
import { commonItems } from "./seed-common";

describe("commonItems", () => {
  it("intersect", () => {
    expect(commonItems([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  it("returns empty array when first array is empty", () => {
    expect(commonItems([], [1, 2, 3])).toEqual([]);
  });

  it("returns empty array when second array is empty", () => {
    expect(commonItems([1, 2, 3], [])).toEqual([]);
  });

  it("returns empty array when no elements overlap", () => {
    expect(commonItems([1, 2, 3], [4, 5, 6])).toEqual([]);
  });

  it("removes duplicates from the first array while preserving order", () => {
    expect(commonItems([1, 1, 2, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("handles a single shared element", () => {
    expect(commonItems([1, 2, 3], [3, 4, 5])).toEqual([3]);
  });

  it("preserves the order of the first array", () => {
    expect(commonItems([3, 1, 2], [1, 2, 3])).toEqual([3, 1, 2]);
  });

  it("works with string elements", () => {
    expect(commonItems(["a", "b", "c"], ["b", "c", "d"])).toEqual(["b", "c"]);
  });

  it("does not include an element that appears only in the second array", () => {
    expect(commonItems([1, 2, 3], [1, 2, 3, 4, 5])).toEqual([1, 2, 3]);
  });

  it("handles duplicates in the second array", () => {
    expect(commonItems([1, 2], [1, 1, 2, 2])).toEqual([1, 2]);
  });
});
