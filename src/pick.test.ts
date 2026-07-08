import { describe, expect, it } from "vitest";

import { pick } from "./pick";

describe("pick", () => {
  it("returns a subset of the object with only the given keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("returns an empty object when given an empty keys array", () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });

  it("returns an empty object when given an empty source object", () => {
    expect(pick({} as Record<string, unknown>, ["a", "b"])).toEqual({});
  });

  it("returns an empty object when both source and keys are empty", () => {
    expect(pick({} as Record<string, never>, [])).toEqual({});
  });

  it("ignores keys that are not present on the object", () => {
    // @ts-expect-error: testing runtime behavior with a key not in the object
    expect(pick({ a: 1, b: 2 }, ["a", "x"])).toEqual({ a: 1 });
  });

  it("returns an empty object when none of the keys exist on the source", () => {
    // @ts-expect-error: testing runtime behavior with keys not in the object
    expect(pick({ a: 1, b: 2 }, ["x", "y"])).toEqual({});
  });

  it("does not mutate the source object", () => {
    const source = { a: 1, b: 2, c: 3 };
    pick(source, ["a", "b"]);
    expect(source).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("picks all keys when given every key of the object", () => {
    expect(pick({ a: 1, b: 2 }, ["a", "b"])).toEqual({ a: 1, b: 2 });
  });

  it("preserves falsy values for picked keys", () => {
    const source = { a: 0, b: false, c: "" } as {
      a: number;
      b: boolean;
      c: string;
    };
    expect(pick(source, ["a", "b", "c"])).toEqual({ a: 0, b: false, c: "" });
  });

  it("returns a new object reference, not the same reference", () => {
    const source = { a: 1, b: 2 };
    const result = pick(source, ["a"]);
    expect(result).not.toBe(source);
    expect(result).toEqual({ a: 1 });
  });
});
