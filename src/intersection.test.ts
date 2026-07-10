import { describe, expect, it } from "vitest";

import { intersection } from "./intersection";

describe("intersection", () => {
  it("returns values present in both arrays", () => {
    const result = intersection([1, 2, 3, 4], [2, 3, 4, 5]);
    expect(result).toEqual([2, 3, 4]);
  });

  it("preserves order from the first array", () => {
    const result = intersection([4, 3, 2, 1], [1, 2, 3, 4]);
    expect(result).toEqual([4, 3, 2, 1]);
  });

  it("returns an empty array when there is no overlap", () => {
    const result = intersection([1, 2, 3], [4, 5, 6]);
    expect(result).toEqual([]);
  });

  it("returns an empty array when either array is empty", () => {
    expect(intersection([], [1, 2, 3])).toEqual([]);
    expect(intersection([1, 2, 3], [])).toEqual([]);
  });

  it("deduplicates values within the result", () => {
    const result = intersection([1, 2, 2, 3, 3, 3], [2, 3]);
    expect(result).toEqual([2, 3]);
  });

  it("works with strings", () => {
    const result = intersection(["a", "b", "c", "d"], ["c", "d", "e"]);
    expect(result).toEqual(["c", "d"]);
  });

  it("handles null entries", () => {
    expect(intersection([1, null, 3], [null, 2, 3])).toEqual([null, 3]);
    expect(intersection([null], [null])).toEqual([null]);
  });

  it("handles undefined entries", () => {
    expect(intersection([1, undefined, 3], [undefined, 2, 3])).toEqual([
      undefined,
      3,
    ]);
    expect(intersection([undefined], [undefined])).toEqual([undefined]);
  });

  it("distinguishes both null and undefined without coalescing them", () => {
    const result = intersection<number | null | undefined>(
      [1, null, undefined, 3],
      [null, 3],
    );
    expect(result).toEqual([null, 3]);
    expect(result).not.toContain(undefined);
  });

  it("supports mixed primitive types without coercion", () => {
    expect(intersection([1, "1", true], [1, "1", true])).toEqual([
      1,
      "1",
      true,
    ]);
    expect(intersection([1, "1", true], [1])).toEqual([1]);
  });

  it("preserves identity (not deep equality) for objects", () => {
    const a = { id: 1 };
    const b = { id: 1 };
    const result = intersection([a, b], [a]);
    expect(result).toEqual([a]);
    expect(result[0]).toBe(a);
  });

  it("supports large arrays without correctness issues", () => {
    const size = 10_000;
    const first = Array.from({ length: size }, (_, i) => i);
    const second = Array.from({ length: size }, (_, i) => i + size / 2);
    const result = intersection(first, second);
    expect(result.length).toBe(size / 2);
    expect(result[0]).toBe(size / 2);
    expect(result[result.length - 1]).toBe(size - 1);
  });

  it("treats NaN as equal to NaN (SameValue semantics via Set)", () => {
    const nanA = Number.NaN;
    const nanB = Number.NaN;
    expect(intersection([nanA], [nanB])).toEqual([nanA]);
  });

  it("treats +0 and -0 as the same value (SameValue semantics)", () => {
    expect(intersection([+0], [-0]).length).toBe(1);
    expect(intersection([-0], [+0]).length).toBe(1);
    expect(Object.is(intersection([+0], [-0])[0], +0)).toBe(true);
    expect(Object.is(intersection([-0], [+0])[0], -0)).toBe(true);
  });

  it("returns a new array that does not share reference with the inputs", () => {
    const a = [1, 2, 3];
    const b = [2, 3, 4];
    const result = intersection(a, b);
    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
  });

  it("does not mutate either input array", () => {
    const a = [1, 2, 2, 3, 3, 3];
    const b = [2, 3];
    const aSnapshot = [...a];
    const bSnapshot = [...b];
    intersection(a, b);
    expect(a).toEqual(aSnapshot);
    expect(b).toEqual(bSnapshot);
  });
});
