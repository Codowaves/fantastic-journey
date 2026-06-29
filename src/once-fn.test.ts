import { describe, expect, it, vi } from "vitest";

import { onceFn } from "./once-fn";

describe("onceFn", () => {
  it("invokes the underlying function only on the first call and caches the result", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const once = onceFn(fn);

    expect(once(1, 2)).toBe(3);
    expect(once(1, 2)).toBe(3);
    expect(once(10, 20)).toBe(3);
    expect(once(99, 1)).toBe(3);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("returns the same cached object reference on subsequent calls", () => {
    const once = onceFn(() => ({ value: 42 }));
    const first = once();
    const second = once();
    expect(first).toBe(second);
    expect(first).toEqual({ value: 42 });
  });

  it("caches undefined when the first invocation returns undefined", () => {
    let calls = 0;
    const once = onceFn(() => {
      calls += 1;
      return undefined;
    });

    expect(once()).toBeUndefined();
    expect(once()).toBeUndefined();
    expect(once()).toBeUndefined();
    expect(calls).toBe(1);
  });

  it("forwards the original arguments on the first call", () => {
    const fn = vi.fn((...args: number[]) => args.reduce((s, n) => s + n, 0));
    const once = onceFn(fn);

    expect(once(1, 2, 3, 4)).toBe(10);
    expect(fn).toHaveBeenCalledWith(1, 2, 3, 4);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
