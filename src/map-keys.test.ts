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

  describe("callback error propagation", () => {
    it("propagates an Error thrown by the callback", () => {
      const input = { a: 1 };
      const boom = new Error("boom");
      expect(() =>
        mapKeys(input, () => {
          throw boom;
        }),
      ).toThrow(boom);
    });

    it("propagates a string thrown by the callback", () => {
      const input = { a: 1 };
      expect(() =>
        mapKeys(input, () => {
          throw "string-error";
        }),
      ).toThrow("string-error");
    });

    it("propagates a TypeError thrown by the callback", () => {
      const input = { a: 1 };
      expect(() =>
        mapKeys(input, () => {
          throw new TypeError("bad type");
        }),
      ).toThrow(TypeError);
    });

    it("stops iterating as soon as the callback throws mid-iteration", () => {
      const input = { a: 1, b: 2, c: 3 };
      const seen: string[] = [];
      expect(() =>
        mapKeys(input, (k) => {
          seen.push(k);
          if (k === "b") {
            throw new Error("stop");
          }
          return k;
        }),
      ).toThrow("stop");
      // The callback was called for "a" and "b", but not "c".
      expect(seen).toEqual(["a", "b"]);
    });

    it("does not call the callback at all when the input is empty", () => {
      let calls = 0;
      mapKeys({} as Record<string, number>, () => {
        calls++;
        return "k";
      });
      expect(calls).toBe(0);
    });
  });

  describe("null / undefined input (TypeError from Object.keys)", () => {
    it("throws TypeError when obj is null", () => {
      expect(() =>
        mapKeys(null as unknown as Record<string, number>, (k) => k),
      ).toThrow(TypeError);
    });

    it("throws TypeError when obj is undefined", () => {
      expect(() =>
        mapKeys(undefined as unknown as Record<string, number>, (k) => k),
      ).toThrow(TypeError);
    });

    it("does not throw on a primitive number (Object.keys coerces to empty)", () => {
      // Object.keys(42) returns [] for primitives, so mapKeys returns {}.
      expect(() =>
        mapKeys(42 as unknown as Record<string, number>, (k) => k),
      ).not.toThrow();
      expect(
        mapKeys(42 as unknown as Record<string, number>, (k) => k),
      ).toEqual({});
    });

    it("does not throw on a primitive boolean (Object.keys coerces to empty)", () => {
      expect(() =>
        mapKeys(true as unknown as Record<string, number>, (k) => k),
      ).not.toThrow();
      expect(
        mapKeys(true as unknown as Record<string, number>, (k) => k),
      ).toEqual({});
    });
  });

  describe("non-throwing edge cases", () => {
    it("does not throw on a frozen input object", () => {
      const frozen = Object.freeze({ a: 1, b: 2 });
      expect(() => mapKeys(frozen, (k) => k.toUpperCase())).not.toThrow();
    });

    it("does not throw on a sealed input object", () => {
      const sealed = Object.seal({ a: 1, b: 2 });
      expect(() => mapKeys(sealed, (k) => k.toUpperCase())).not.toThrow();
    });

    it("does not throw on an object with a null prototype", () => {
      const input = Object.create(null) as Record<string, number>;
      input.a = 1;
      input.b = 2;
      expect(() => mapKeys(input, (k) => k)).not.toThrow();
      expect(mapKeys(input, (k) => k)).toEqual({ a: 1, b: 2 });
    });

    it("ignores inherited properties (Object.keys only enumerates own keys)", () => {
      const proto = { inherited: 99 };
      const child = Object.create(proto) as Record<string, number>;
      child.own = 1;
      const result = mapKeys(child, (k) => `_${k}`);
      expect(result).toEqual({ _own: 1 });
      expect("_inherited" in result).toBe(false);
    });

    it("propagates errors thrown by getters while reading values", () => {
      // Object.keys enumerates own properties (including "boom"), then
      // obj[key] reads the value via the getter. The throw propagates.
      const obj: Record<string, number> = { keep: 1 };
      Object.defineProperty(obj, "boom", {
        enumerable: true,
        get() {
          throw new Error("getter ran");
        },
      });
      expect(() => mapKeys(obj, (k) => k)).toThrow("getter ran");
    });

    it("does not invoke non-enumerable getters (Object.keys skips them)", () => {
      let getterCalled = false;
      const obj: Record<string, number> = { keep: 1 };
      Object.defineProperty(obj, "hidden", {
        enumerable: false,
        get() {
          getterCalled = true;
          return 99;
        },
      });
      const result = mapKeys(obj, (k) => k);
      expect(result).toEqual({ keep: 1 });
      expect(getterCalled).toBe(false);
    });
  });
});
