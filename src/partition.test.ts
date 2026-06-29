import { describe, expect, it } from "vitest";

import { partition } from "./partition";

describe("partition", () => {
  it("splits numbers by an even/odd predicate", () => {
    expect(partition([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0)).toEqual([
      [2, 4, 6],
      [1, 3, 5],
    ]);
  });

  it("returns two empty arrays for an empty input", () => {
    expect(partition<number>([], () => true)).toEqual([[], []]);
  });

  it("puts every item into pass when pred is always true", () => {
    expect(partition([1, 2, 3], () => true)).toEqual([[1, 2, 3], []]);
  });

  it("puts every item into fail when pred is always false", () => {
    expect(partition([1, 2, 3], () => false)).toEqual([[], [1, 2, 3]]);
  });

  it("preserves input order within each bucket", () => {
    const items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    const [pass, fail] = partition(items, (n) => n > 3);
    expect(pass).toEqual([4, 5, 9, 6, 5, 5]);
    expect(fail).toEqual([3, 1, 1, 2, 3]);
  });
});
