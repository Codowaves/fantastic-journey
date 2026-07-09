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
    it("propagates an Error thrown by the predicate", () => {
      const obj = { a: 1, b: 2 };
      const boom = new Error("predicate blew up");
      expect(() =>
        pickBy(obj, () => {
          throw boom;
        }),
      ).toThrow(boom);
    });

    it("propagates a string thrown by the predicate", () => {
      const obj = { a: 1 };
      expect(() =>
        pickBy(obj, () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw "string-error";
        }),
      ).toThrow("string-error");
    });

    it("propagates a TypeError thrown by the predicate", () => {
      const obj = { a: 1 };
      const err = new TypeError("bad predicate");
      expect(() =>
        pickBy(obj, () => {
          throw err;
        }),
      ).toThrow(err);
    });

    it("throws when given null", () => {
      // Object.keys(null) throws TypeError: Cannot convert undefined or null to object
      expect(() =>
        pickBy(null as unknown as Record<string, number>, () => true),
      ).toThrow(TypeError);
    });

    it("throws when given undefined", () => {
      // Object.keys(undefined) throws TypeError
      expect(() =>
        pickBy(undefined as unknown as Record<string, number>, () => true),
      ).toThrow(TypeError);
    });

    it("throws when given a number primitive", () => {
      // Object.keys coerces numbers via Number wrapper; safe to pass but
      // passing a plain number is a type-system violation that the runtime
      // surfaces as "Cannot convert … to object" only for null/undefined.
      // Numbers get boxed, so we expect an empty result rather than a throw.
      expect(
        pickBy(42 as unknown as Record<string, number>, () => true),
      ).toEqual({});
    });

    it("throws when given a boolean primitive (boxed, no own keys)", () => {
      expect(
        pickBy(true as unknown as Record<string, number>, () => true),
      ).toEqual({});
    });

    it("does not throw on a frozen source object", () => {
      const obj = Object.freeze({ a: 1, b: 2, c: 3 });
      expect(() => pickBy(obj, () => true)).not.toThrow();
      expect(pickBy(obj, (v) => v > 1)).toEqual({ b: 2, c: 3 });
    });

    it("does not throw on a sealed source object", () => {
      const obj = Object.seal({ a: 1, b: 2 });
      expect(() => pickBy(obj, () => true)).not.toThrow();
      expect(pickBy(obj, (v) => v === 2)).toEqual({ b: 2 });
    });

    it("does not throw on a non-extensible source object", () => {
      const obj = Object.preventExtensions({ a: 1, b: 2 });
      expect(() => pickBy(obj, () => true)).not.toThrow();
      expect(pickBy(obj, () => false)).toEqual({});
    });

    it("propagates an error thrown by an accessor (getter) on the source", () => {
      const boom = new Error("getter exploded");
      const obj: Record<string, number> = {};
      Object.defineProperty(obj, "bad", {
        enumerable: true,
        get() {
          throw boom;
        },
      });
      Object.defineProperty(obj, "ok", {
        enumerable: true,
        value: 7,
      });
      // pickBy reads `obj[key]` for each key, so the throwing getter fires
      // before the predicate can be invoked.
      expect(() => pickBy(obj, () => true)).toThrow(boom);
    });

    it("propagates an error thrown by a throwing Object.keys-like override", () => {
      // An object whose [[OwnPropertyKeys]]-style hook throws: we can't
      // override Object.keys, but we can pass a Proxy that throws on the
      // ownKeys trap, which is what Object.keys ultimately consults.
      const boom = new Error("proxy rejected");
      const proxy = new Proxy(
        { a: 1 },
        {
          ownKeys() {
            throw boom;
          },
        },
      );
      expect(() =>
        pickBy(proxy as unknown as Record<string, number>, () => true),
      ).toThrow(boom);
    });

    it("does not throw when the predicate returns truthy non-boolean values", () => {
      // Truthiness is the only branch; non-boolean truthy values must not
      // throw or be coerced in a way that surfaces an error.
      const obj = { a: 1, b: 2 };
      expect(() => pickBy(obj, () => 1 as unknown as boolean)).not.toThrow();
      expect(() =>
        pickBy(obj, () => "yes" as unknown as boolean),
      ).not.toThrow();
      expect(() => pickBy(obj, () => ({}) as unknown as boolean)).not.toThrow();
    });

    it("does not throw when the predicate returns falsy non-boolean values", () => {
      const obj = { a: 1, b: 2 };
      expect(() => pickBy(obj, () => 0 as unknown as boolean)).not.toThrow();
      expect(() => pickBy(obj, () => "" as unknown as boolean)).not.toThrow();
      expect(() => pickBy(obj, () => null as unknown as boolean)).not.toThrow();
    });

    it("propagates an error thrown on the first invocation of the predicate", () => {
      // Confirms the loop visits every key (not just the first) and surfaces
      // throws from the very first call without swallowing them.
      const obj = { first: 1, second: 2, third: 3 };
      let calls = 0;
      expect(() =>
        pickBy(obj, () => {
          calls += 1;
          throw new Error(`call-${calls}`);
        }),
      ).toThrow("call-1");
      expect(calls).toBe(1);
    });

    it("stops iterating when the predicate throws mid-iteration", () => {
      // If pickBy caught and ignored predicate errors, this test would see
      // 3 calls. Since it propagates, calls must stop at the throw site.
      const obj = { a: 1, b: 2, c: 3 };
      let calls = 0;
      expect(() =>
        pickBy(obj, (_v, k) => {
          calls += 1;
          if (k === "b") throw new Error("stop");
          return true;
        }),
      ).toThrow("stop");
      expect(calls).toBe(2);
    });
  });
});
