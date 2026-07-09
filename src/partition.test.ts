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

  it("propagates an error thrown by the predicate", () => {
    const boom = new Error("boom");
    expect(() =>
      partition([1, 2, 3], () => {
        throw boom;
      }),
    ).toThrow(boom);
  });

  it("propagates a non-Error thrown by the predicate", () => {
    expect(() =>
      partition([1, 2, 3], () => {
        throw "string-thrown";
      }),
    ).toThrow("string-thrown");
  });

  it("stops iteration once the predicate throws on a later element", () => {
    const seen: number[] = [];
    expect(() =>
      partition([1, 2, 3, 4, 5], (n) => {
        seen.push(n);
        if (n === 3) throw new Error("stop at 3");
        return n % 2 === 0;
      }),
    ).toThrow("stop at 3");
    expect(seen).toEqual([1, 2, 3]);
  });

  it("propagates a TypeError when items is not an array", () => {
    expect(() => partition(null as unknown as number[], (n) => n > 0)).toThrow(
      TypeError,
    );
  });

  it("propagates a TypeError when pred is not a function", () => {
    expect(() =>
      partition([1, 2, 3], "not-a-fn" as unknown as (n: number) => boolean),
    ).toThrow(TypeError);
  });
});
