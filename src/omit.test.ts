import { describe, expect, it } from "vitest";

import { omit } from "./omit";

describe("omit", () => {
  it("returns a copy of the object without the given keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("returns the full object when given an empty keys array", () => {
    expect(omit({ a: 1, b: 2 }, [])).toEqual({ a: 1, b: 2 });
  });

  it("ignores keys that are not present on the object", () => {
    // @ts-expect-error: testing runtime behavior with a key not in the object
    expect(omit({ a: 1, b: 2 }, ["a", "x"])).toEqual({ b: 2 });
  });

  it("does not mutate the source object", () => {
    const source = { a: 1, b: 2, c: 3 };
    omit(source, ["b"]);
    expect(source).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("handles omitting multiple keys", () => {
    expect(omit({ a: 1, b: 2, c: 3, d: 4 }, ["b", "d"])).toEqual({
      a: 1,
      c: 3,
    });
  });
});
