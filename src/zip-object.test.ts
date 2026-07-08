import { describe, expect, it } from "vitest";

import { zipObject } from "./zip-object";

describe("zipObject", () => {
  it("builds an object from parallel key and value arrays of strings", () => {
    expect(zipObject(["a", "b", "c"], ["x", "y", "z"])).toEqual({
      a: "x",
      b: "y",
      c: "z",
    });
  });

  it("preserves mixed value types", () => {
    expect(zipObject(["n", "b", "arr"], [1, true, [1, 2]])).toEqual({
      n: 1,
      b: true,
      arr: [1, 2],
    });
  });

  it("returns an empty object for two empty arrays", () => {
    expect(zipObject<string, number>([], [])).toEqual({});
  });

  it("accepts numeric keys (PropertyKey widening)", () => {
    expect(zipObject<number, string>([1, 2, 3], ["a", "b", "c"])).toEqual({
      1: "a",
      2: "b",
      3: "c",
    });
  });

  it("lets later entries overwrite earlier ones when keys repeat", () => {
    expect(zipObject(["a", "b", "a"], [1, 2, 3])).toEqual({ a: 3, b: 2 });
  });

  it("keeps array values by reference rather than copying them", () => {
    const inner = [1, 2];
    const result = zipObject(["k"], [inner]);
    expect(result.k).toBe(inner);
  });

  describe("error/throw paths", () => {
    it("throws RangeError when vals is shorter than keys", () => {
      expect(() => zipObject(["a", "b"], [1])).toThrow(RangeError);
    });

    it("throws RangeError when vals is longer than keys", () => {
      expect(() => zipObject(["a"], [1, 2])).toThrow(RangeError);
    });

    it("throws when keys is empty but vals is not", () => {
      expect(() => zipObject<string, number>([], [1])).toThrow(RangeError);
    });

    it("throws when vals is empty but keys is not", () => {
      expect(() => zipObject(["a"], [])).toThrow(RangeError);
    });

    it("includes both lengths in the RangeError message", () => {
      let caught: unknown;
      try {
        zipObject(["a", "b", "c"], [1]);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(RangeError);
      expect((caught as Error).message).toContain("3");
      expect((caught as Error).message).toContain("1");
    });

    it("throws synchronously before allocating the result object", () => {
      expect(() => zipObject(["a"], [1, 2])).toThrow(RangeError);
    });
  });

  it("does not mutate the input arrays", () => {
    const keys = ["a", "b"];
    const vals = [1, 2];
    zipObject(keys, vals);
    expect(keys).toEqual(["a", "b"]);
    expect(vals).toEqual([1, 2]);
  });

  it("supports falsy values (0, false, '', null) at every index", () => {
    expect(zipObject(["a", "b", "c", "d"], [0, false, "", null])).toEqual({
      a: 0,
      b: false,
      c: "",
      d: null,
    });
  });
});
