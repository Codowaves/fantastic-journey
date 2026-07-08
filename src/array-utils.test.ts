import { describe, expect, it } from "vitest";

import { unique } from "./array-utils";

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

  describe("error/throw paths", () => {
    it("throws TypeError when arr is null", () => {
      expect(() => unique(null as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when arr is undefined", () => {
      expect(() => unique(undefined as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when arr is NaN", () => {
      expect(() => unique(NaN as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when arr is a finite number", () => {
      expect(() => unique(123 as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when arr is a string", () => {
      expect(() => unique("foo" as unknown as number[])).toThrow(TypeError);
    });

    it("throws TypeError when arr is a plain object (no Array.isArray match)", () => {
      expect(() => unique({ length: 0 } as unknown as number[])).toThrow(
        TypeError,
      );
    });

    it("throws TypeError when arr is a boolean", () => {
      expect(() => unique(true as unknown as number[])).toThrow(TypeError);
    });

    it("includes the canonical message for null", () => {
      let caught: unknown;
      try {
        unique(null as unknown as number[]);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(TypeError);
      expect((caught as Error).message).toBe("arr must be an array");
    });

    it("includes the canonical message for undefined", () => {
      let caught: unknown;
      try {
        unique(undefined as unknown as number[]);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(TypeError);
      expect((caught as Error).message).toBe("arr must be an array");
    });

    it("includes the canonical message for NaN", () => {
      let caught: unknown;
      try {
        unique(NaN as unknown as number[]);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(TypeError);
      expect((caught as Error).message).toBe("arr must be an array");
    });

    it("includes the canonical message for non-array values", () => {
      let caught: unknown;
      try {
        unique("foo" as unknown as number[]);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(TypeError);
      expect((caught as Error).message).toBe("arr must be an array");
    });

    it("throws synchronously before allocating the result", () => {
      expect(() => unique(null as unknown as number[])).toThrow(TypeError);
      expect(() => unique(undefined as unknown as number[])).toThrow(TypeError);
    });

    it("does not throw for a valid empty array", () => {
      expect(() => unique([])).not.toThrow();
    });

    it("does not throw for a valid populated array", () => {
      expect(() => unique([1, 2, 3])).not.toThrow();
    });

    it("does not throw for an array-like Set spread (valid array)", () => {
      expect(() => unique([1, 1, 2, 2, 3])).not.toThrow();
    });
  });
});
