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
});
