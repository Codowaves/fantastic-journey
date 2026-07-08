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

  it("propagates errors thrown by the key function", () => {
    expect(() =>
      keyBy([1, 2, 3], (n) => {
        if (n === 2) throw new Error("boom");
        return String(n);
      }),
    ).toThrowError("boom");
  });

  it("supports symbol keys", () => {
    const a = Symbol("a");
    const b = Symbol("b");
    const result = keyBy([a, b], (s) => s);
    expect(result[a]).toBe(a);
    expect(result[b]).toBe(b);
    expect(Object.getOwnPropertySymbols(result)).toEqual([a, b]);
  });

  it("indexes items whose key is the literal string 'null'", () => {
    expect(keyBy([null, null] as Array<null>, () => "null")).toEqual({
      null: null,
    });
  });
});
