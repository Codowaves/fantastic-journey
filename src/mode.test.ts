import { describe, expect, it } from "vitest";

import { mode } from "./mode";

describe("mode", () => {
  it("returns undefined for an empty array", () => {
    expect(mode([])).toBeUndefined();
  });

  it("returns the single value for a one-element array", () => {
    expect(mode([7])).toBe(7);
  });

  it("returns the most frequent value", () => {
    expect(mode([1, 2, 2, 3, 3, 3, 4])).toBe(3);
  });

  it("returns the first value seen on a tie", () => {
    expect(mode([1, 1, 2, 2, 3])).toBe(1);
  });

  it("exercises the initial bestCount=0 -> update branch on the very first element", () => {
    // The first iteration must always update `best` because bestCount starts at 0.
    expect(mode([99])).toBe(99);
  });

  it("does not update `best` when the running count ties the current best", () => {
    // [5, 5, 6, 6]: after 5, best=5, bestCount=2; after 6 first time, c=1, no update;
    // after 6 second time, c=2 == bestCount, the `c > bestCount` branch is false.
    expect(mode([5, 5, 6, 6])).toBe(5);
  });

  it("exercises the Map `?? 0` fallback when a value is seen for the first time", () => {
    // Each of the 3 elements hits the `counts.get(n) ?? 0` branch the first time
    // it is encountered, then the increment path on the second occurrence.
    expect(mode([1, 2, 1, 2, 1])).toBe(1);
  });

  it("returns the value that eventually wins after a long streak beats an early leader", () => {
    // 1 leads at count 2, then 2 overthrows it with count 3.
    expect(mode([1, 1, 2, 2, 2])).toBe(2);
  });

  it("preserves the earliest value when a later value ties it exactly", () => {
    // 1 is seen first (best=1, bestCount=2), then 2 ties at 2, then 3 ties at 2.
    // None of the later ties should override `best`.
    expect(mode([1, 1, 2, 2, 3, 3])).toBe(1);
  });

  it("handles an array containing negative numbers", () => {
    expect(mode([-1, -2, -2, -3])).toBe(-2);
  });

  it("handles an array containing zero", () => {
    // 0 must beat nothing → best=0, bestCount=1; then 1 makes best=1.
    expect(mode([0, 1, 1])).toBe(1);
  });

  it("treats 0 as a valid mode when it is the most frequent value", () => {
    // The falsy initial value (best=undefined) must NOT cause 0 to be skipped.
    expect(mode([0, 0, 1, 2])).toBe(0);
  });

  it("does not throw on a large array with a clear winner", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr.push(500);
    arr.push(500);
    arr.push(500);
    expect(() => mode(arr)).not.toThrow();
    expect(mode(arr)).toBe(500);
  });

  it("does not throw on a large all-equal array", () => {
    const arr = new Array(1000).fill(42);
    expect(() => mode(arr)).not.toThrow();
    expect(mode(arr)).toBe(42);
  });

  it("returns the only element as mode when the entire array is identical", () => {
    expect(mode([7, 7, 7, 7, 7])).toBe(7);
  });

  it("handles floating point numbers", () => {
    expect(mode([1.5, 2.5, 1.5, 3.5])).toBe(1.5);
  });

  it("handles an array where the mode is at the end", () => {
    // The loop must finish and return `best` after every iteration is exhausted.
    expect(mode([1, 2, 1, 2, 1])).toBe(1);
  });

  it("handles a two-element array where the second element is the mode", () => {
    expect(mode([1, 2, 2])).toBe(2);
  });

  it("does not mutate the input array", () => {
    const input = [3, 1, 2, 1];
    const snapshot = [...input];
    mode(input);
    expect(input).toEqual(snapshot);
  });
});
