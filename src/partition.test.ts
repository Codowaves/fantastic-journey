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

  describe("error/throw paths", () => {
    it("does not throw for a normal array with a well-behaved predicate", () => {
      expect(() => partition([1, 2, 3], (n) => n > 1)).not.toThrow();
    });

    it("does not throw for an empty array regardless of predicate body", () => {
      // An empty input must short-circuit the loop before pred runs.
      expect(() => partition<number>([], () => true)).not.toThrow();
      expect(() =>
        partition<number>([], () => {
          throw new Error("should not be called");
        }),
      ).not.toThrow();
    });

    it("propagates an error thrown by the predicate on the first item", () => {
      const boom = () => {
        throw new Error("predicate exploded on first item");
      };
      expect(() => partition([1, 2, 3], boom)).toThrow(
        "predicate exploded on first item",
      );
    });

    it("propagates an error thrown by the predicate on a later item", () => {
      let calls = 0;
      const explodeOnThird = (n: number) => {
        calls += 1;
        if (calls === 3) throw new Error("boom");
        return n > 0;
      };
      expect(() => partition([1, 2, 3, 4], explodeOnThird)).toThrow("boom");
      expect(calls).toBe(3);
    });

    it("preserves the original error instance when the predicate throws", () => {
      class CustomError extends Error {}
      const fail = () => {
        throw new CustomError("custom failure");
      };
      let caught: unknown = null;
      try {
        partition([42], fail);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(CustomError);
      expect((caught as Error).message).toBe("custom failure");
    });

    it("does not mutate the input when a predicate throws", () => {
      const items = [1, 2, 3, 4];
      const snapshot = [...items];
      const explodeOnSecond = (n: number) => {
        if (n === 2) throw new Error("boom");
        return true;
      };
      expect(() => partition(items, explodeOnSecond)).toThrow();
      expect(items).toEqual(snapshot);
    });

    it("returns fresh inner arrays even when no error is thrown", () => {
      const items = [1, 2, 3];
      const [pass, fail] = partition(items, (n) => n > 1);
      expect(pass).not.toBe(items);
      expect(fail).not.toBe(items);
      // Mutating the returned buckets must not affect the input.
      pass.push(99);
      fail.push(99);
      expect(items).toEqual([1, 2, 3]);
    });

    it("does not throw for predicates that return non-boolean truthy/falsy values", () => {
      // Predicate that intentionally returns truthy/falsy but not literally booleans.
      const yes = (_: number): unknown => 1;
      const no = (_: number): unknown => 0;
      expect(() =>
        partition([1, 2, 3], yes as (n: number) => boolean),
      ).not.toThrow();
      expect(() =>
        partition([1, 2, 3], no as (n: number) => boolean),
      ).not.toThrow();
      expect(partition([1, 2, 3], yes as (n: number) => boolean)).toEqual([
        [1, 2, 3],
        [],
      ]);
      expect(partition([1, 2, 3], no as (n: number) => boolean)).toEqual([
        [],
        [1, 2, 3],
      ]);
    });

    it("does not throw on a frozen input array", () => {
      const frozen = Object.freeze([1, 2, 3, 4]) as readonly number[];
      // Cast satisfies the readonly signature for the call site.
      expect(() =>
        partition(frozen as number[], (n) => n % 2 === 0),
      ).not.toThrow();
    });
  });
});
