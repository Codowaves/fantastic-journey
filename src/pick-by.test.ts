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

  it("rethrows errors thrown by the predicate", () => {
    const obj = { a: 1, b: 2 };
    expect(() =>
      pickBy(obj, (v) => {
        if (v === 2) throw new Error("boom");
        return true;
      }),
    ).toThrow("boom");
  });

  it("does not call the predicate after an error halts iteration", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const seen: string[] = [];
    expect(() =>
      pickBy(obj, (_v, k) => {
        seen.push(k);
        if (k === "b") throw new Error("stop");
        return true;
      }),
    ).toThrow("stop");
    expect(seen).toEqual(["a", "b"]);
  });

  it("preserves falsy matching values such as 0, false, and ''", () => {
    const obj = { a: 0, b: false, c: "", d: 1, e: true };
    // The `if (pred(...))` branch must include entries whose value is falsy
    // but whose predicate returns a truthy result.
    expect(pickBy(obj, () => true)).toEqual(obj);
  });

  it("preserves values mapped to undefined when the predicate returns truthy", () => {
    const obj: { a: number | undefined; b: number } = { a: undefined, b: 2 };
    expect(pickBy(obj, (_v, k) => k === "a")).toEqual({ a: undefined });
  });

  it("skips entries for which the predicate returns a falsy value", () => {
    // Each branch of `if (pred(...))` where the predicate returns a falsy
    // value must omit the key from the result.
    const obj = { keep: 1, drop0: 2, dropNull: 3, dropEmpty: 4 };
    expect(
      pickBy(obj, (v) => {
        if (v === 2) return 0;
        if (v === 3) return null;
        if (v === 4) return "";
        return v === 1;
      }),
    ).toEqual({ keep: 1 });
  });

  it("does not throw when called with an empty object and a never-truthy predicate", () => {
    expect(() =>
      pickBy({} as Record<string, number>, () => false),
    ).not.toThrow();
  });

  it("does not throw when every key has a null value", () => {
    const obj = { a: null, b: null };
    expect(pickBy(obj, () => true)).toEqual(obj);
  });
});
