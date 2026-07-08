import { describe, expect, it } from "vitest";

import { hasDuplicates } from "./has-duplicates";

describe("hasDuplicates", () => {
  describe("basic duplicate detection", () => {
    it("detects a duplicate", () => {
      expect(hasDuplicates([1, 2, 3, 2])).toBe(true);
    });

    it("returns false when all unique", () => {
      expect(hasDuplicates([1, 2, 3, 4])).toBe(false);
    });
  });

  describe("empty / single-element arrays", () => {
    it("handles an empty array", () => {
      expect(hasDuplicates([])).toBe(false);
    });

    it("handles a single-element array (loop body never executes the duplicate branch)", () => {
      expect(hasDuplicates([42])).toBe(false);
    });

    it("returns true for a single-element array's only item seen twice (the loop-body branch)", () => {
      // Two iterations: the first adds, the second triggers the early return.
      expect(hasDuplicates(["a", "a"])).toBe(true);
    });
  });

  describe("early-return branch", () => {
    it("exercises the early-return branch when the duplicate is the first pair", () => {
      // The first two items already match — the loop returns before processing the rest.
      expect(hasDuplicates([1, 1, 2, 3, 4, 5])).toBe(true);
    });

    it("exercises the early-return branch when the duplicate is the last pair", () => {
      // All items are unique until the final iteration forces a return.
      expect(hasDuplicates([1, 2, 3, 4, 5, 5])).toBe(true);
    });

    it("exercises the early-return branch when the duplicate is in the middle", () => {
      expect(hasDuplicates([1, 2, 3, 3, 4, 5])).toBe(true);
    });

    it("returns true on a many-duplicates array (first match wins)", () => {
      // The first 1,1 pair triggers the early return; subsequent duplicates are not visited.
      expect(hasDuplicates([1, 1, 2, 2, 3, 3, 4, 4, 5, 5])).toBe(true);
    });
  });

  describe("loop-completion branch", () => {
    it("exercises the loop-completion branch on a large all-unique array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      expect(hasDuplicates(arr)).toBe(false);
    });

    it("exercises the loop-completion branch on a large array that contains a duplicate", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      arr[999] = 0;
      expect(hasDuplicates(arr)).toBe(true);
    });

    it("returns false on a two-element unique array (full traversal, no match)", () => {
      expect(hasDuplicates(["x", "y"])).toBe(false);
    });
  });

  describe("Set-based fallback branch (SameValueZero semantics)", () => {
    it("treats NaN as a duplicate of itself via the Set-based fallback branch", () => {
      // Set treats NaN as equal to NaN, so the second occurrence triggers the early return.
      expect(hasDuplicates([Number.NaN, Number.NaN])).toBe(true);
    });

    it("treats +0 and -0 as duplicates via the Set-based fallback branch", () => {
      // Set uses SameValueZero equality, so +0 === -0 counts as a duplicate.
      expect(hasDuplicates([0, -0])).toBe(true);
    });

    it("returns false for a single NaN (no second occurrence to trigger the branch)", () => {
      expect(hasDuplicates([Number.NaN])).toBe(false);
    });

    it("returns false for a single -0 (no second occurrence to trigger the branch)", () => {
      expect(hasDuplicates([-0])).toBe(false);
    });

    it("treats many NaNs as duplicates (first NaN repeats trigger early return)", () => {
      expect(hasDuplicates([Number.NaN, Number.NaN, Number.NaN])).toBe(true);
    });

    it("treats null and undefined as distinct under SameValueZero", () => {
      // SameValueZero treats null !== undefined, so this is not a duplicate.
      expect(hasDuplicates([null, undefined])).toBe(false);
    });

    it("treats two nulls as duplicates", () => {
      expect(hasDuplicates([null, null])).toBe(true);
    });

    it("treats two undefineds as duplicates", () => {
      expect(hasDuplicates([undefined, undefined])).toBe(true);
    });
  });

  describe("reference-type fallback branch", () => {
    it("treats two distinct object references as non-duplicates", () => {
      expect(hasDuplicates([{ a: 1 }, { a: 1 }])).toBe(false);
    });

    it("treats the same object reference seen twice as a duplicate", () => {
      const obj = { a: 1 };
      expect(hasDuplicates([obj, obj])).toBe(true);
    });

    it("treats two distinct array references with equal contents as non-duplicates", () => {
      expect(
        hasDuplicates([
          [1, 2],
          [1, 2],
        ]),
      ).toBe(false);
    });

    it("treats the same array reference seen twice as a duplicate", () => {
      const inner = [1, 2];
      expect(hasDuplicates([inner, inner])).toBe(true);
    });
  });

  describe("error / throw paths", () => {
    it("does not throw on well-defined edge inputs", () => {
      expect(() => hasDuplicates([])).not.toThrow();
      expect(() => hasDuplicates([1])).not.toThrow();
      expect(() => hasDuplicates([null, null])).not.toThrow();
      expect(() => hasDuplicates([undefined, undefined])).not.toThrow();
    });

    it("does not throw on arrays containing NaN", () => {
      expect(() => hasDuplicates([Number.NaN, Number.NaN])).not.toThrow();
      expect(() => hasDuplicates([1, Number.NaN, 3])).not.toThrow();
    });

    it("does not throw on arrays containing +0 and -0", () => {
      expect(() => hasDuplicates([0, -0])).not.toThrow();
    });

    it("does not throw on very large arrays (completes the loop body)", () => {
      const arr = Array.from({ length: 10_000 }, (_, i) => i);
      expect(() => hasDuplicates(arr)).not.toThrow();
    });
  });

  describe("readonly / frozen input arrays", () => {
    it("accepts readonly arrays without throwing", () => {
      const ro: readonly number[] = Object.freeze([1, 2, 3]);
      expect(() => hasDuplicates(ro)).not.toThrow();
      expect(hasDuplicates(ro)).toBe(false);
    });

    it("accepts readonly arrays containing a duplicate", () => {
      const ro: readonly number[] = Object.freeze([1, 2, 3, 2]);
      expect(() => hasDuplicates(ro)).not.toThrow();
      expect(hasDuplicates(ro)).toBe(true);
    });

    it("does not mutate the input array", () => {
      const arr = [1, 2, 3];
      const snapshot = [...arr];
      hasDuplicates(arr);
      expect(arr).toEqual(snapshot);
    });
  });
});
