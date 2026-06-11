import { describe, expect, it, vi } from "vitest";

import { once } from "./once";

describe("once", () => {
  it("runs the underlying function only once on first call", () => {
    const fn = vi.fn((n: number) => n * 2);
    const onceFn = once(fn);

    expect(onceFn(3)).toBe(6);
    expect(onceFn(3)).toBe(6);
    expect(onceFn(3)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("returns the cached result even with different arguments", () => {
    const fn = vi.fn((n: number) => n * 2);
    const onceFn = once(fn);

    expect(onceFn(3)).toBe(6);
    expect(onceFn(5)).toBe(6); // Still returns 6, not 10
    expect(onceFn(10)).toBe(6); // Still returns 6, not 20
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it("preserves the return value of the underlying function", () => {
    const onceFn = once((x: number) => ({ value: x }));
    const first = onceFn(7);
    const second = onceFn(7);
    const third = onceFn(99);

    expect(first).toBe(second);
    expect(first).toBe(third);
    expect(first).toEqual({ value: 7 });
  });

  it("works with functions that take multiple arguments", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const onceFn = once(fn);

    expect(onceFn(1, 2)).toBe(3);
    expect(onceFn(5, 10)).toBe(3); // Still returns 3
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, 2);
  });

  it("works with functions that take no arguments", () => {
    const fn = vi.fn(() => 42);
    const onceFn = once(fn);

    expect(onceFn()).toBe(42);
    expect(onceFn()).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
