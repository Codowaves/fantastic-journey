import { describe, expect, it } from "vitest";

import { pick } from "./pick";

describe("pick", () => {
  it("returns a subset of the object with only the given keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("returns an empty object when given an empty keys array", () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });

  it("ignores keys that are not present on the object", () => {
    // @ts-expect-error: testing runtime behavior with a key not in the object
    expect(pick({ a: 1, b: 2 }, ["a", "x"])).toEqual({ a: 1 });
  });

  it("does not mutate the source object", () => {
    const source = { a: 1, b: 2, c: 3 };
    pick(source, ["a", "b"]);
    expect(source).toEqual({ a: 1, b: 2, c: 3 });
  });

  describe("edge cases", () => {
    it("returns an empty object for an empty source object", () => {
      expect(pick({} as Record<string, never>, [])).toEqual({});
    });

    it("returns an empty object when none of the requested keys are present", () => {
      // @ts-expect-error: testing runtime behavior with keys not in the object
      expect(pick({ a: 1, b: 2 }, ["x", "y"])).toEqual({});
    });

    it("returns a value of `undefined` for keys whose value is `undefined`", () => {
      const obj: { a: number; b: number | undefined } = { a: 1, b: undefined };
      const result = pick(obj, ["a", "b"]);
      expect(result).toEqual({ a: 1, b: undefined });
      expect("b" in result).toBe(true);
    });

    it("preserves falsy values (0, false, empty string, null)", () => {
      const obj = { a: 0, b: false, c: "", d: null as null };
      expect(pick(obj, ["a", "b", "c", "d"])).toEqual({
        a: 0,
        b: false,
        c: "",
        d: null,
      });
    });

    it("handles duplicate keys in the keys array (last write wins per in-check)", () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ["a", "a", "b"])).toEqual({ a: 1, b: 2 });
    });

    it("returns a shallow copy (mutating the result does not affect the source)", () => {
      const source = { a: 1, b: { nested: 2 } };
      const result = pick(source, ["a", "b"]);
      result.a = 99;
      expect(source.a).toBe(1);
      expect(result).not.toBe(source);
      expect(result.b).toBe(source.b);
    });

    it("handles a single-key selection", () => {
      expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
    });

    it("handles selecting all keys of the object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ["a", "b", "c"])).toEqual(obj);
    });
  });
});
