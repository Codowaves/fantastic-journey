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
    // @ts-expect-error: empty source has no keys of its own
    expect(pick({}, ["a", "b"])).toEqual({});
  });

  it("ignores keys that are not present on the object", () => {
    // @ts-expect-error: testing runtime behavior with a key not in the object
    expect(pick({ a: 1, b: 2 }, ["a", "x"])).toEqual({ a: 1 });
  });

  it("picks all keys when the keys list matches every property", () => {
    expect(pick({ a: 1, b: 2 }, ["a", "b"])).toEqual({ a: 1, b: 2 });
  });

  it("returns a single-key object", () => {
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
  });

  it("preserves undefined values for present keys", () => {
    expect(pick({ a: undefined, b: 2 }, ["a", "b"])).toEqual({
      a: undefined,
      b: 2,
    });
  });

  it("preserves null values for present keys", () => {
    expect(pick({ a: null, b: 2 }, ["a", "b"])).toEqual({ a: null, b: 2 });
  });

  it("preserves falsy values such as 0, false, and ''", () => {
    expect(pick({ a: 0, b: false, c: "", d: 1 }, ["a", "b", "c", "d"])).toEqual(
      { a: 0, b: false, c: "", d: 1 },
    );
  });

  it("performs a shallow copy and shares references for nested values", () => {
    const nested = { x: 1 };
    const source = { a: nested, b: 2 };
    const result = pick(source, ["a"]);
    expect(result.a).toBe(nested);
    expect(result.a).toEqual({ x: 1 });
  });

  it("duplicates a value when the same key appears multiple times in keys", () => {
    expect(pick({ a: 1, b: 2 }, ["a", "a"])).toEqual({ a: 1 });
  });

  it("returns a new object reference, not the source itself", () => {
    const source = { a: 1, b: 2 };
    const result = pick(source, ["a"]);
    expect(result).not.toBe(source);
  });

  it("includes inherited prototype properties via `in` check", () => {
    const proto = { inherited: "from-proto" };
    const source = Object.create(proto) as Record<string, unknown>;
    source.a = 1;
    expect(pick(source, ["a", "inherited"])).toEqual({
      a: 1,
      inherited: "from-proto",
    });
  });

  it("does not mutate the source object", () => {
    const source = { a: 1, b: 2, c: 3 };
    pick(source, ["a", "b"]);
    expect(source).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("accepts a readonly-keys array parameter", () => {
    const keys: readonly ("a" | "b")[] = ["a", "b"];
    expect(pick({ a: 1, b: 2, c: 3 }, keys)).toEqual({ a: 1, b: 2 });
  });
});
