import { describe, expect, it } from "vitest";

import { hasDuplicates } from "./has-duplicates";

describe("hasDuplicates", () => {
  it("detects a duplicate", () => {
    expect(hasDuplicates([1, 2, 3, 2])).toBe(true);
  });

  it("returns false when all unique", () => {
    expect(hasDuplicates([1, 2, 3, 4])).toBe(false);
  });

  it("handles an empty array", () => {
    expect(hasDuplicates([])).toBe(false);
  });

  it("exercises the early-return branch when the duplicate is the first pair", () => {
    // The first two items already match — the loop returns before processing the rest.
    expect(hasDuplicates([1, 1, 2, 3, 4, 5])).toBe(true);
  });

  it("exercises the early-return branch when the duplicate is the last pair", () => {
    // All items are unique until the final iteration forces a return.
    expect(hasDuplicates([1, 2, 3, 4, 5, 5])).toBe(true);
  });

  it("exercises the loop-completion branch on a large all-unique array", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    expect(hasDuplicates(arr)).toBe(false);
  });

  it("exercises the loop-completion branch on a large array that contains a duplicate", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr[999] = 0;
    expect(hasDuplicates(arr)).toBe(true);
  });

  it("returns true for a single-element array's only item seen twice (the loop-body branch)", () => {
    // Two iterations: the first adds, the second triggers the early return.
    expect(hasDuplicates(["a", "a"])).toBe(true);
  });

  it("handles a single-element array (loop body never executes the duplicate branch)", () => {
    expect(hasDuplicates([42])).toBe(false);
  });

  it("treats NaN as a duplicate of itself via the Set-based fallback branch", () => {
    // Set treats NaN as equal to NaN, so the second occurrence triggers the early return.
    expect(hasDuplicates([Number.NaN, Number.NaN])).toBe(true);
  });

  it("treats +0 and -0 as duplicates via the Set-based fallback branch", () => {
    // Set uses SameValueZero equality, so +0 === -0 counts as a duplicate.
    expect(hasDuplicates([0, -0])).toBe(true);
  });

  it("does not throw on well-defined edge inputs", () => {
    expect(() => hasDuplicates([])).not.toThrow();
    expect(() => hasDuplicates([1])).not.toThrow();
    expect(() => hasDuplicates([null, null])).not.toThrow();
    expect(() => hasDuplicates([undefined, undefined])).not.toThrow();
  });

  it("accepts readonly arrays without throwing", () => {
    const ro: readonly number[] = Object.freeze([1, 2, 3]);
    expect(() => hasDuplicates(ro)).not.toThrow();
    expect(hasDuplicates(ro)).toBe(false);
  });
});
