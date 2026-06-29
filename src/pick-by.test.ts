import { describe, expect, it } from "vitest";

import { pickBy } from "./pick-by";

describe("pickBy", () => {
  it("keeps keys whose value matches the predicate", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    expect(pickBy(obj, (v) => v % 2 === 0)).toEqual({ b: 2, d: 4 });
  });

  it("passes both value and key to the predicate", () => {
    const seen: Array<[unknown, string]> = [];
    const obj = { a: 1, b: 2, c: 3 };
    pickBy(obj, (value, key) => {
      seen.push([value, key]);
      return false;
    });
    expect(seen).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  it("does not mutate the source object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const snapshot = { ...obj };
    pickBy(obj, () => true);
    expect(obj).toEqual(snapshot);
  });

  it("returns a copy of the object when every key matches", () => {
    const obj = { a: 1, b: 2 };
    expect(pickBy(obj, () => true)).toEqual(obj);
  });

  it("returns an empty object when no key matches", () => {
    const obj = { a: 1, b: 2 };
    expect(pickBy(obj, () => false)).toEqual({});
  });

  it("returns an empty object for an empty input", () => {
    expect(pickBy({} as Record<string, number>, () => true)).toEqual({});
  });

  it("uses the key argument to filter entries", () => {
    const obj = { keep: 1, skip: 2, also_keep: 3 };
    expect(
      pickBy(obj, (_v, k) => k.startsWith("keep") || k.startsWith("also")),
    ).toEqual({
      keep: 1,
      also_keep: 3,
    });
  });
});
