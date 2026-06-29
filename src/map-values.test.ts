import { describe, expect, it } from "vitest";

import { mapValues } from "./map-values";

describe("mapValues", () => {
  it("maps each value through the function", () => {
    expect(mapValues({ a: 1, b: 2, c: 3 }, (n) => n * 2)).toEqual({
      a: 2,
      b: 4,
      c: 6,
    });
  });

  it("passes the key as the second argument", () => {
    const result = mapValues({ a: 1, b: 2 }, (_value, key) =>
      key.toUpperCase(),
    );
    expect(result).toEqual({ a: "A", b: "B" });
  });

  it("returns an empty object for an empty input", () => {
    expect(mapValues({}, (n: number) => n * 2)).toEqual({});
  });

  it("does not mutate the input object", () => {
    const input = { a: 1, b: 2 };
    mapValues(input, (n) => n * 10);
    expect(input).toEqual({ a: 1, b: 2 });
  });

  it("can change the value type via the function", () => {
    const result = mapValues({ count: 1, total: 5 }, (n) => String(n));
    expect(result).toEqual({ count: "1", total: "5" });
  });
});
