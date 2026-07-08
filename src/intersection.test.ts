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

  it("throws TypeError when the first argument is null", () => {
    expect(() => intersection(null as unknown as never[], [1, 2])).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when the first argument is undefined", () => {
    expect(() => intersection(undefined as unknown as never[], [1, 2])).toThrow(
      TypeError,
    );
  });

  it("returns an empty array when the second argument is null", () => {
    expect(intersection([1, 2], null as unknown as never[])).toEqual([]);
  });

  it("returns an empty array when the second argument is undefined", () => {
    expect(intersection([1, 2], undefined as unknown as never[])).toEqual([]);
  });

  it("throws TypeError when the first argument is not iterable", () => {
    expect(() => intersection(42 as unknown as never[], [1, 2])).toThrow(
      TypeError,
    );
    expect(() => intersection({} as unknown as never[], [1, 2])).toThrow(
      TypeError,
    );
  });
});
