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

  it("does not collapse consecutive NaN values", () => {
    expect(dedupeAdjacent([NaN, NaN, 1])).toEqual([NaN, NaN, 1]);
  });

  it("collapses runs of booleans", () => {
    expect(dedupeAdjacent([true, true, false, false, true])).toEqual([
      true,
      false,
      true,
    ]);
  });

  it("collapses runs of empty strings", () => {
    expect(dedupeAdjacent(["", "", "x", ""])).toEqual(["", "x", ""]);
  });

  it("handles all falsy primitive values", () => {
    expect(dedupeAdjacent([0, 0, "", "", false, false, null, null])).toEqual([
      0,
      "",
      false,
      null,
    ]);
  });

  it("preserves the boundary between a single non-run at the start", () => {
    expect(dedupeAdjacent([1, 2, 2, 2])).toEqual([1, 2]);
  });

  it("preserves the boundary between a single non-run at the end", () => {
    expect(dedupeAdjacent([2, 2, 2, 3])).toEqual([2, 3]);
  });

  it("collapses runs in the middle of the array", () => {
    expect(dedupeAdjacent([1, 2, 2, 3])).toEqual([1, 2, 3]);
  });

  it("treats two adjacent runs of the same value as one merged run", () => {
    expect(dedupeAdjacent([1, 1, 2, 1, 1])).toEqual([1, 2, 1]);
  });

  it("handles a large alternating array without collapsing non-adjacent duplicates", () => {
    const input: number[] = [];
    for (let i = 0; i < 100; i++) input.push(i % 2);
    expect(dedupeAdjacent(input)).toEqual(input);
  });

  it("collapses a long run of identical items to a single element", () => {
    const input = new Array(100).fill("x");
    expect(dedupeAdjacent(input)).toEqual(["x"]);
  });

  it("does not mutate the input when it contains a long run", () => {
    const input = [1, 1, 1, 2, 3, 3];
    const copy = [...input];
    dedupeAdjacent(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array instance (does not return the input)", () => {
    const input = [1, 2, 3];
    const result = dedupeAdjacent(input);
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  it("handles sparse arrays without throwing on empty slots", () => {
    const sparse: number[] = [];
    sparse[2] = 5;
    expect(() => dedupeAdjacent(sparse)).not.toThrow();
    expect(dedupeAdjacent(sparse)).toEqual([undefined, 5]);
  });

  it("does not throw when comparing against an undefined previous slot", () => {
    const sparse: number[] = [];
    sparse[1] = 7;
    expect(() => dedupeAdjacent(sparse)).not.toThrow();
    expect(dedupeAdjacent(sparse)).toEqual([undefined, 7]);
  });

  it("handles an array created via the Array constructor without throwing", () => {
    const constructed = new Array<number>(3);
    expect(() => dedupeAdjacent(constructed)).not.toThrow();
    expect(dedupeAdjacent(constructed)).toEqual([undefined]);
  });

  it("does not throw when adjacent values are undefined literals", () => {
    expect(() => dedupeAdjacent([undefined, undefined, 1])).not.toThrow();
    expect(dedupeAdjacent([undefined, undefined, 1])).toEqual([undefined, 1]);
  });
});
