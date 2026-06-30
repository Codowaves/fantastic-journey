import { describe, expect, it } from "vitest";

import { mapKeys } from "./map-keys";

describe("mapKeys", () => {
  it("maps every key through fn", () => {
    const input = { a: 1, b: 2, c: 3 };
    expect(mapKeys(input, (k) => k.toUpperCase())).toEqual({
      A: 1,
      B: 2,
      C: 3,
    });
  });

  it("preserves the values untouched", () => {
    const input = { foo: "hello", bar: "world" };
    const result = mapKeys(input, (k) => `_${k}`);
    expect(result._foo).toBe("hello");
    expect(result._bar).toBe("world");
  });

  it("returns an empty object for an empty input", () => {
    expect(mapKeys({} as Record<string, number>, (k) => k)).toEqual({});
  });

  it("lets later keys overwrite earlier ones when fn collides", () => {
    const input = { a: 1, b: 2, c: 3 };
    expect(mapKeys(input, () => "k" as const)).toEqual({ k: 3 });
  });

  it("supports changing the key type (number keys)", () => {
    const input = { a: 10, b: 20 };
    const result = mapKeys(input, (k) => k.charCodeAt(0));
    expect(result).toEqual({ 97: 10, 98: 20 });
  });

  it("does not mutate the input object", () => {
    const input: Record<string, number> = { a: 1, b: 2 };
    const snapshot = { ...input };
    mapKeys(input, (k) => k.toUpperCase());
    expect(input).toEqual(snapshot);
  });

  it("handles a single-key object", () => {
    expect(mapKeys({ only: "x" }, (k) => `prefix:${k}`)).toEqual({
      "prefix:only": "x",
    });
  });
});
