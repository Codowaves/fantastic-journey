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

  it("handles a single-key object", () => {
    expect(mapValues({ only: 7 }, (n) => n + 1)).toEqual({ only: 8 });
  });

  it("handles null and undefined values in the input", () => {
    const input: Record<string, number | null | undefined> = {
      a: null,
      b: undefined,
      c: 3,
    };
    const result = mapValues(input, (v) => (v == null ? -1 : v * 2));
    expect(result).toEqual({ a: -1, b: -1, c: 6 });
  });

  it("returns a new object even when the mapper returns undefined", () => {
    const result = mapValues({ a: 1, b: 2 }, () => undefined);
    expect(result).toEqual({ a: undefined, b: undefined });
    expect(Object.keys(result)).toEqual(["a", "b"]);
  });

  it("propagates errors thrown by the mapper", () => {
    expect(() =>
      mapValues({ a: 1 }, () => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
  });

  it("ignores inherited (non-own) properties", () => {
    const proto = { inherited: 99 } as Record<string, number>;
    const input = Object.create(proto) as Record<string, number>;
    input.own = 1;
    expect(mapValues(input, (n) => n * 2)).toEqual({ own: 2 });
  });
});
