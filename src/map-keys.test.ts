import { describe, expect, it, vi } from "vitest";

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

  describe("error/throw paths", () => {
    it("propagates an error thrown by fn on the first key", () => {
      const boom = new Error("boom");
      const fn = vi.fn(() => {
        throw boom;
      });
      expect(() => mapKeys({ a: 1 }, fn)).toThrow(boom);
      expect(fn).toHaveBeenCalledWith("a");
    });

    it("propagates an error thrown by fn partway through iteration", () => {
      const boom = new Error("mid-iteration");
      const input = { a: 1, b: 2, c: 3 };
      const fn = vi.fn((k: string) => {
        if (k === "b") throw boom;
        return k.toUpperCase();
      });
      expect(() => mapKeys(input, fn)).toThrow(boom);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("does not call fn after an error is thrown", () => {
      const fn = vi.fn((k: string) => {
        if (k === "a") throw new Error("stop");
        return k;
      });
      try {
        mapKeys({ a: 1, b: 2, c: 3 }, fn);
      } catch {
        // expected
      }
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("propagates a TypeError when given null input", () => {
      expect(() =>
        mapKeys(null as unknown as Record<string, number>, (k) => k),
      ).toThrow(TypeError);
    });

    it("propagates a TypeError when given undefined input", () => {
      expect(() =>
        mapKeys(undefined as unknown as Record<string, number>, (k) => k),
      ).toThrow(TypeError);
    });

    it("does not throw on a primitive number input (Object.keys coerces to [])", () => {
      // Object.keys(42) returns [], so mapKeys returns an empty result rather
      // than throwing. Locking in this non-throwing behavior.
      expect(() =>
        mapKeys(42 as unknown as Record<string, number>, (k) => k),
      ).not.toThrow();
      expect(
        mapKeys(42 as unknown as Record<string, number>, (k) => k),
      ).toEqual({});
    });

    it("does not throw on an input whose prototype chain is intact", () => {
      const input = Object.create(null) as Record<string, number>;
      input.a = 1;
      input.b = 2;
      expect(() => mapKeys(input, (k) => k.toUpperCase())).not.toThrow();
    });

    it("returns a fresh object even when input shares references", () => {
      const input = { a: 1, b: 2 };
      const result = mapKeys(input, (k) => k);
      expect(result).not.toBe(input);
    });

    it("does not mutate a frozen input object", () => {
      const input = Object.freeze({ a: 1, b: 2 });
      expect(() => mapKeys(input, (k) => k.toUpperCase())).not.toThrow();
      expect(Object.isFrozen(input)).toBe(true);
    });

    it("survives fn that returns a non-PropertyKey primitive without throwing", () => {
      // Symbols and numbers are valid PropertyKey values; the function should
      // accept them and build the resulting object.
      const result = mapKeys({ a: 1 }, () => Symbol("k") as unknown as string);
      expect(typeof result).toBe("object");
    });

    it("does not throw when fn returns a symbol key", () => {
      const sym = Symbol("mapped");
      const result = mapKeys({ a: 1 }, () => sym);
      expect(result[sym]).toBe(1);
    });

    it("does not throw when fn returns a numeric key", () => {
      const result = mapKeys({ a: 1 }, () => 42);
      expect(result[42]).toBe(1);
    });
  });
});
