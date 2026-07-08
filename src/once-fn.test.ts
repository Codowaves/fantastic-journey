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

  describe("error/throw paths", () => {
    it("propagates the error from a throwing function on the first call", () => {
      const boom = new Error("boom");
      const fn = vi.fn(() => {
        throw boom;
      });
      const once = onceFn(fn);

      expect(() => once()).toThrow(boom);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("does not re-invoke the function when the first call throws", () => {
      const fn = vi.fn(() => {
        throw new Error("boom");
      });
      const once = onceFn(fn);

      expect(() => once()).toThrow("boom");

      // Once `called` was set to true before fn() threw, subsequent calls
      // hit the cached branch (result === undefined) and never reach fn again.
      expect(once()).toBeUndefined();
      expect(once()).toBeUndefined();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("returns undefined forever after a throwing first call, even with fresh arguments", () => {
      const fn = vi.fn((a: number) => {
        if (a < 0) throw new Error("negative");
        return a;
      });
      const once = onceFn(fn);

      expect(() => once(-1)).toThrow("negative");
      // The throw path locks the wrapper; fresh args don't trigger a retry.
      expect(once(99)).toBeUndefined();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("propagates the error type faithfully (custom error subclass)", () => {
      class CustomError extends Error {
        readonly code = "CUSTOM";
      }
      const fn = vi.fn(() => {
        throw new CustomError("bad");
      });
      const once = onceFn(fn);

      try {
        once();
        expect.fail("expected throw");
      } catch (e) {
        expect(e).toBeInstanceOf(CustomError);
        expect((e as CustomError).code).toBe("CUSTOM");
      }

      // After the first throw, `called` is true and `result` stays undefined.
      // Subsequent calls return undefined rather than throwing again.
      expect(once()).toBeUndefined();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("does not throw for a normal first call and caches the value", () => {
      const once = onceFn(() => 7);

      expect(() => once()).not.toThrow();
      expect(once()).toBe(7);
    });

    it("returns the cached value when subsequent calls would otherwise throw", () => {
      // First call succeeds and caches; later calls must not invoke fn even
      // though the args differ. If fn were re-invoked it would throw.
      let invocations = 0;
      const once = onceFn((a: number) => {
        invocations += 1;
        if (a === 0) return "safe";
        throw new Error("only zero is safe");
      });

      expect(once(0)).toBe("safe");
      expect(() => once(1)).not.toThrow();
      expect(once(1)).toBe("safe");
      expect(invocations).toBe(1);
    });
  });
});
