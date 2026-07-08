import { describe, expect, it, vi } from "vitest";

import { memoize } from "./memoize";

describe("memoize", () => {
  it("runs the underlying function once per distinct args and returns the cached result", () => {
    const fn = vi.fn((n: number) => n * 2);
    const memoized = memoize(fn);

    expect(memoized(3)).toBe(6);
    expect(memoized(3)).toBe(6);
    expect(memoized(3)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);

    expect(memoized(4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);

    expect(memoized(4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("caches by JSON-serialized args, distinguishing different argument shapes", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);

    expect(memoized(1, 2)).toBe(3);
    expect(memoized(2, 1)).toBe(3);
    expect(memoized(1, 2)).toBe(3);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("preserves the return value of the underlying function", () => {
    const memoized = memoize((x: number) => ({ value: x }));
    const first = memoized(7);
    const second = memoized(7);
    expect(first).toBe(second);
    expect(first).toEqual({ value: 7 });
  });

  it("throws TypeError when fn is null or undefined", () => {
    expect(() =>
      memoize(null as unknown as (...args: number[]) => number),
    ).toThrow(TypeError);
    expect(() =>
      memoize(undefined as unknown as (...args: number[]) => number),
    ).toThrow(TypeError);
  });

  it("throws TypeError when fn is not a function", () => {
    expect(() =>
      memoize(42 as unknown as (...args: number[]) => number),
    ).toThrow(TypeError);
    expect(() =>
      memoize("not-a-fn" as unknown as (...args: number[]) => number),
    ).toThrow(TypeError);
    expect(() =>
      memoize({} as unknown as (...args: number[]) => number),
    ).toThrow(TypeError);
  });
});
