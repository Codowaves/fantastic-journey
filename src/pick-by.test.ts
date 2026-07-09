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

  describe("error/throw paths", () => {
    it("propagates an error thrown by the predicate", () => {
      const obj = { a: 1, b: 2 };
      const boom = new Error("predicate exploded");
      expect(() =>
        pickBy(obj, () => {
          throw boom;
        }),
      ).toThrow(boom);
    });

    it("propagates a TypeError when given null", () => {
      expect(() =>
        pickBy(null as unknown as Record<string, number>, () => true),
      ).toThrow(TypeError);
    });

    it("propagates a TypeError when given undefined", () => {
      expect(() =>
        pickBy(undefined as unknown as Record<string, number>, () => true),
      ).toThrow(TypeError);
    });

    it("returns an empty object when given a primitive number (Object.keys returns [])", () => {
      // Object.keys(42) returns [] — no throw, no keys.
      expect(
        pickBy(42 as unknown as Record<string, number>, () => true),
      ).toEqual({});
    });

    it("returns an empty object when given a boolean primitive (Object.keys returns [])", () => {
      // Object.keys(true) returns [] — no throw, no keys.
      expect(
        pickBy(true as unknown as Record<string, number>, () => true),
      ).toEqual({});
    });

    it("enumerates own string indices when given a primitive string", () => {
      // Object.keys("ab") returns ['0', '1']; pickBy reads via property access.
      const result = pickBy(
        "ab" as unknown as Record<string, number>,
        () => true,
      );
      expect(result).toEqual({ "0": "a", "1": "b" });
    });

    it("propagates a getter-thrown error when reading matching keys", () => {
      // Object.keys invokes the getter indirectly via property access in
      // `obj[key]` — locking in that the error reaches the caller.
      let getterCalled = false;
      const obj: Record<string, number> = { safe: 1 };
      Object.defineProperty(obj, "boom", {
        enumerable: true,
        get() {
          getterCalled = true;
          throw new Error("getter exploded");
        },
      });
      expect(() =>
        pickBy(obj, (_v, k) => k === "boom" || k === "safe"),
      ).toThrow("getter exploded");
      expect(getterCalled).toBe(true);
    });

    it("ignores non-enumerable own keys (Object.keys skips them)", () => {
      const obj = {};
      Object.defineProperty(obj, "hidden", {
        value: 1,
        enumerable: false,
      });
      expect(pickBy(obj as Record<string, unknown>, () => true)).toEqual({});
    });

    it("reads from a frozen source without throwing", () => {
      const frozen = Object.freeze({ a: 1, b: 2 });
      expect(pickBy(frozen, (v) => v > 1)).toEqual({ b: 2 });
    });

    it("reads from a sealed source without throwing", () => {
      const sealed = Object.seal({ a: 1, b: 2 });
      expect(pickBy(sealed, (v) => v > 1)).toEqual({ b: 2 });
    });

    it("reads from an object with a null prototype without throwing", () => {
      const obj = Object.create(null);
      obj.a = 1;
      obj.b = 2;
      expect(pickBy(obj, (v) => v % 2 === 0)).toEqual({ b: 2 });
    });

    it("does not throw on any common object shape", () => {
      const frozen = Object.freeze({ a: 1, b: 2 });
      const sealed = Object.seal({ a: 1, b: 2 });
      const nullProto = Object.create(null);
      nullProto.a = 1;
      expect(() => pickBy({ a: 1 }, () => true)).not.toThrow();
      expect(() => pickBy(frozen, () => true)).not.toThrow();
      expect(() => pickBy(sealed, () => true)).not.toThrow();
      expect(() => pickBy(nullProto, () => true)).not.toThrow();
      expect(() =>
        pickBy({} as Record<string, number>, () => true),
      ).not.toThrow();
    });
  });
});
