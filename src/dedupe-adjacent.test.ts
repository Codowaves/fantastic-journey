import { describe, expect, it } from "vitest";

import { dedupeAdjacent } from "./dedupe-adjacent";

describe("dedupeAdjacent", () => {
  it("collapses runs of equal numbers", () => {
    expect(dedupeAdjacent([1, 1, 2, 2, 2, 3, 1])).toEqual([1, 2, 3, 1]);
  });

  it("returns the same array when no adjacent duplicates exist", () => {
    expect(dedupeAdjacent([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns a single element when every item is the same", () => {
    expect(dedupeAdjacent([7, 7, 7, 7])).toEqual([7]);
  });

  it("preserves non-adjacent duplicates", () => {
    expect(dedupeAdjacent([1, 2, 1, 2, 1])).toEqual([1, 2, 1, 2, 1]);
  });

  it("handles strings", () => {
    expect(dedupeAdjacent(["a", "a", "b", "a", "a", "a", "c"])).toEqual([
      "a",
      "b",
      "a",
      "c",
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(dedupeAdjacent<string>([])).toEqual([]);
  });

  it("returns a single-element array for a one-item input", () => {
    expect(dedupeAdjacent([42])).toEqual([42]);
  });

  it("treats null as distinct from undefined", () => {
    expect(dedupeAdjacent([null, undefined, null, undefined])).toEqual([
      null,
      undefined,
      null,
      undefined,
    ]);
  });

  it("treats 0 and -0 as equal under strict equality", () => {
    expect(dedupeAdjacent([0, -0, 0])).toEqual([0]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 1, 2, 2, 3];
    const copy = [...input];
    dedupeAdjacent(input);
    expect(input).toEqual(copy);
  });

  it("collapses adjacent duplicates of the same object reference", () => {
    const shared = { id: 1 };
    expect(dedupeAdjacent([shared, shared, shared])).toEqual([shared]);
  });

  it("preserves distinct object references even when adjacent", () => {
    const result = dedupeAdjacent([{ id: 1 }, { id: 1 }]);
    expect(result.length).toBe(2);
  });
});
