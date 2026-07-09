import { describe, expect, it } from "vitest";

import { keyBy } from "./key-by";

describe("keyBy", () => {
  it("indexes an array of objects by a derived string key", () => {
    const users = [
      { id: "u1", name: "Ada" },
      { id: "u2", name: "Linus" },
    ];
    expect(keyBy(users, (u) => u.id)).toEqual({
      u1: { id: "u1", name: "Ada" },
      u2: { id: "u2", name: "Linus" },
    });
  });

  it("indexes an array by a numeric key derived from each item", () => {
    expect(keyBy([10, 20, 30], (n) => n / 10)).toEqual({
      1: 10,
      2: 20,
      3: 30,
    });
  });

  it("lets later items overwrite earlier ones that share a key", () => {
    const items = [
      { id: "a", version: 1 },
      { id: "b", version: 1 },
      { id: "a", version: 2 },
    ];
    expect(keyBy(items, (x) => x.id)).toEqual({
      a: { id: "a", version: 2 },
      b: { id: "b", version: 1 },
    });
  });

  it("returns an empty object for empty input", () => {
    expect(keyBy<number, string>([], (n) => String(n))).toEqual({});
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    const snapshot = [...input];
    keyBy(input, (n) => n);
    expect(input).toEqual(snapshot);
  });

  it("throws when arr is null", () => {
    expect(() => keyBy(null as unknown as number[], (n) => n)).toThrow(
      TypeError,
    );
  });

  it("throws when arr is undefined", () => {
    expect(() => keyBy(undefined as unknown as number[], (n) => n)).toThrow(
      TypeError,
    );
  });

  it("throws when fn is not a function", () => {
    expect(() =>
      keyBy([1, 2, 3], "not a function" as unknown as (n: number) => string),
    ).toThrow(TypeError);
  });

  it("throws when fn returns null", () => {
    expect(() => keyBy([1, 2], () => null as unknown as string)).toThrow(
      TypeError,
    );
  });

  it("throws when fn returns undefined", () => {
    expect(() => keyBy([1, 2], () => undefined as unknown as string)).toThrow(
      TypeError,
    );
  });

  it("throws when fn returns NaN", () => {
    expect(() => keyBy([1, 2], () => Number.NaN as unknown as number)).toThrow(
      TypeError,
    );
  });
});
