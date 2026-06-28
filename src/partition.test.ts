import { describe, expect, it } from "vitest";

import { partition } from "./partition";

describe("partition", () => {
  it("partitions numbers into even and odd", () => {
    expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
      [2, 4],
      [1, 3],
    ]);
  });

  it("returns two empty arrays for an empty input", () => {
    expect(partition([], () => true)).toEqual([[], []]);
  });

  it("puts every item in pass when the predicate always returns true", () => {
    expect(partition([1, 2, 3], () => true)).toEqual([[1, 2, 3], []]);
  });

  it("puts every item in fail when the predicate always returns false", () => {
    expect(partition([1, 2, 3], () => false)).toEqual([[], [1, 2, 3]]);
  });

  it("preserves input order within each output array", () => {
    const [pass, fail] = partition([3, 1, 4, 1, 5, 9, 2, 6], (n) => n > 3);
    expect(pass).toEqual([4, 5, 9, 6]);
    expect(fail).toEqual([3, 1, 1, 2]);
  });

  it("works on objects with a property predicate", () => {
    const items = [
      { kind: "a", n: 1 },
      { kind: "b", n: 2 },
      { kind: "a", n: 3 },
      { kind: "b", n: 4 },
    ];
    const [aItems, bItems] = partition(items, (i) => i.kind === "a");
    expect(aItems).toEqual([
      { kind: "a", n: 1 },
      { kind: "a", n: 3 },
    ]);
    expect(bItems).toEqual([
      { kind: "b", n: 2 },
      { kind: "b", n: 4 },
    ]);
  });

  it("does not mutate the source array", () => {
    const source = [1, 2, 3, 4];
    partition(source, (n) => n % 2 === 0);
    expect(source).toEqual([1, 2, 3, 4]);
  });
});
