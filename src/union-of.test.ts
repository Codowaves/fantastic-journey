import { describe, expect, it } from "vitest";

import { unionOf } from "./union-of";

describe("unionOf", () => {
  it("returns unique values from both arrays", () => {
    expect(unionOf([1, 2, 3], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it("preserves the order of first occurrence across both inputs", () => {
    expect(unionOf([3, 1, 2], [2, 4, 1])).toEqual([3, 1, 2, 4]);
  });

  it("returns an empty array when both inputs are empty", () => {
    expect(unionOf<number>([], [])).toEqual([]);
  });

  it("returns the unique elements when one input is empty", () => {
    expect(unionOf([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(unionOf<number>([], [4, 5])).toEqual([4, 5]);
  });

  it("deduplicates within and across both arrays", () => {
    expect(unionOf([1, 1, 2], [2, 2, 3])).toEqual([1, 2, 3]);
  });

  it("supports string values", () => {
    expect(unionOf(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input arrays", () => {
    const a = [1, 2, 3];
    const b = [3, 4];
    unionOf(a, b);
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([3, 4]);
  });
});
