import { describe, expect, it } from "vitest";

import { shuffle, unique } from "./array-utils";

describe("unique", () => {
  it("removes duplicate values and preserves order", () => {
    const result = unique([1, 2, 2, 3, 1, 4]);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("preserves the first occurrence of duplicates", () => {
    const result = unique(["a", "b", "a", "c", "b"]);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array when given an empty array", () => {
    const result = unique([]);
    expect(result).toEqual([]);
  });

  it("returns the same array when all elements are unique", () => {
    const result = unique([1, 2, 3, 4, 5]);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles an array with all identical values", () => {
    const result = unique([7, 7, 7, 7]);
    expect(result).toEqual([7]);
  });

  it("works with different types (strings)", () => {
    const result = unique(["foo", "bar", "foo", "baz"]);
    expect(result).toEqual(["foo", "bar", "baz"]);
  });

  it("works with boolean values", () => {
    const result = unique([true, false, true, true, false]);
    expect(result).toEqual([true, false]);
  });
});

describe("shuffle", () => {
  it("returns an array with the same elements (multiset equality)", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.slice().sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    shuffle(input);
    expect(input).toEqual(snapshot);
  });

  it("returns an empty array when given an empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("returns a single-element array unchanged", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("produces a different ordering at least once across many trials", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    let sawDifferentOrdering = false;
    for (let i = 0; i < 50; i++) {
      const result = shuffle(input);
      if (result.some((v, idx) => v !== input[idx])) {
        sawDifferentOrdering = true;
        break;
      }
    }
    expect(sawDifferentOrdering).toBe(true);
  });

  it("handles strings", () => {
    const input = ["a", "b", "c", "d"];
    const result = shuffle(input);
    expect(result.slice().sort()).toEqual(input.slice().sort());
  });
});
