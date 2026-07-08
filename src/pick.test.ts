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

  it("returns an empty object when picking from an empty source object", () => {
    // @ts-expect-error: testing runtime behavior with an empty object
    expect(pick({}, ["a", "b"])).toEqual({});
  });

  it("returns an empty object when both source and keys are empty", () => {
    expect(pick({} as Record<string, never>, [])).toEqual({});
  });

  it("preserves a single key", () => {
    expect(pick({ a: 1 }, ["a"])).toEqual({ a: 1 });
  });

  it("handles keys with falsy values (0, '', false, null)", () => {
    const obj = { a: 0, b: "", c: false, d: null, e: undefined };
    expect(pick(obj, ["a", "b", "c", "d", "e"])).toEqual({
      a: 0,
      b: "",
      c: false,
      d: null,
      e: undefined,
    });
  });

  it("preserves nested object references without deep copying", () => {
    const nested = { inner: 1 };
    const result = pick({ a: nested, b: 2 }, ["a"]);
    expect(result).toEqual({ a: nested });
    expect((result as { a: typeof nested }).a).toBe(nested);
  });

  it("returns a new object reference, not the same as the source", () => {
    const source = { a: 1, b: 2 };
    expect(pick(source, ["a", "b"])).not.toBe(source);
  });

  it("ignores duplicate keys in the keys array (last write wins)", () => {
    const source = { a: 1, b: 2 };
    expect(pick(source, ["a", "a", "b", "a"])).toEqual({ a: 1, b: 2 });
  });

  it("includes keys whose value is explicitly undefined", () => {
    const obj: Record<string, number | undefined> = { a: undefined, b: 2 };
    expect(pick(obj, ["a", "b"])).toEqual({ a: undefined, b: 2 });
    expect("a" in pick(obj, ["a", "b"])).toBe(true);
  });

  it("handles a source with only one key and picks it", () => {
    expect(pick({ x: "hello" }, ["x"])).toEqual({ x: "hello" });
  });

  it("includes inherited properties from the prototype chain via `in` check", () => {
    const proto = { inherited: "fromProto" };
    const source = Object.create(proto) as { own: number };
    source.own = 42;
    // @ts-expect-error: testing runtime behavior with prototype-inherited keys
    expect(pick(source, ["own", "inherited"])).toEqual({
      own: 42,
      inherited: "fromProto",
    });
  });
});
