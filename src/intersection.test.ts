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

  describe("skipped-branch coverage (item not in b or already seen)", () => {
    it("skips items in a that are not present in b", () => {
      // Exercises the false-arm of `set.has(item)` on every element.
      const result = intersection([1, 2, 3, 4, 5], [9, 10]);
      expect(result).toEqual([]);
    });

    it("skips repeats of items already emitted in the result", () => {
      // Exercises the false-arm of `seen.has(item)` on repeated values.
      const result = intersection([1, 2, 2, 2, 3, 3], [2, 3]);
      expect(result).toEqual([2, 3]);
    });

    it("treats null and undefined in a as values filtered against b", () => {
      // null/undefined are valid values; they don't trigger any special path
      // and should only appear in the result if b also contains them.
      expect(intersection([1, null, 3], [null, 4])).toEqual([null]);
      expect(intersection([1, undefined, 3], [undefined, 4])).toEqual([
        undefined,
      ]);
    });
  });

  describe("frozen and sealed arrays", () => {
    it("does not throw on a frozen array", () => {
      const a = Object.freeze([1, 2, 3, 4]) as number[];
      const b = Object.freeze([2, 3]) as number[];
      expect(() => intersection(a, b)).not.toThrow();
      expect(intersection(a, b)).toEqual([2, 3]);
    });

    it("does not throw on a sealed array", () => {
      const a = Object.seal([4, 3, 2, 1]) as number[];
      const b = Object.seal([1, 2, 3, 4]) as number[];
      expect(() => intersection(a, b)).not.toThrow();
      expect(intersection(a, b)).toEqual([4, 3, 2, 1]);
    });

    it("does not mutate either input", () => {
      const a = [1, 2, 3, 4];
      const b = [2, 3];
      const aSnapshot = [...a];
      const bSnapshot = [...b];
      intersection(a, b);
      expect(a).toEqual(aSnapshot);
      expect(b).toEqual(bSnapshot);
    });
  });

  describe("error/throw paths", () => {
    it("does not throw on normal arrays", () => {
      expect(() => intersection([1, 2, 3], [2, 3])).not.toThrow();
    });

    it("does not throw on empty arrays", () => {
      expect(() => intersection([], [1, 2, 3])).not.toThrow();
      expect(() => intersection([1, 2, 3], [])).not.toThrow();
      expect(() => intersection([], [])).not.toThrow();
    });

    it("does not throw when inputs contain null or undefined", () => {
      const a = [1, null, undefined, 4] as Array<number | null | undefined>;
      const b = [null, undefined] as Array<number | null | undefined>;
      expect(() => intersection(a, b)).not.toThrow();
    });

    it("does not throw when b contains duplicates of its own values", () => {
      // The Set built from b naturally collapses duplicates before lookup; the
      // skipped-branch path should still hold steady.
      expect(() => intersection([1, 2, 3], [2, 2, 2, 3])).not.toThrow();
    });
  });
});
