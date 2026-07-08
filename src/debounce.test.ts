import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("single call fires after the wait", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("hello");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("hello");
  });

  it("rapid calls collapse to one invocation with the latest args", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(50);
    debounced("second");
    vi.advanceTimersByTime(50);
    debounced("third");

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("cancel prevents the pending call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("hello");
    debounced.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it("throws RangeError for negative waitMs", () => {
    const fn = vi.fn();
    expect(() => debounce(fn, -1)).toThrow(RangeError);
  });

  it("throws RangeError for non-finite waitMs", () => {
    const fn = vi.fn();
    expect(() => debounce(fn, Infinity)).toThrow(RangeError);
    expect(() => debounce(fn, NaN)).toThrow(RangeError);
  });

  describe("error / fallback branches", () => {
    describe("waitMs validation guard", () => {
      it("does not throw at the boundary waitMs = 0", () => {
        const fn = vi.fn();
        expect(() => debounce(fn, 0)).not.toThrow();
      });

      it("throws RangeError for waitMs = -Infinity (non-finite + negative)", () => {
        const fn = vi.fn();
        expect(() => debounce(fn, -Infinity)).toThrow(RangeError);
      });

      it("throws RangeError for waitMs = -0.0001 (negative sub-zero)", () => {
        const fn = vi.fn();
        expect(() => debounce(fn, -0.0001)).toThrow(RangeError);
      });

      it("accepts a huge but finite waitMs (1e308 stays finite, no throw)", () => {
        const fn = vi.fn();
        // 1e308 is below MAX_VALUE so it remains finite — the guard should
        // not trigger.
        const huge = 1e308;
        expect(Number.isFinite(huge)).toBe(true);
        expect(() => debounce(fn, huge)).not.toThrow();
      });

      it("throws RangeError for waitMs = MAX_VALUE * 2 (overflows to Infinity)", () => {
        const fn = vi.fn();
        // MAX_VALUE * 2 overflows to Infinity, which fails the isFinite guard.
        const overflowing = Number.MAX_VALUE * 2;
        expect(Number.isFinite(overflowing)).toBe(false);
        expect(() => debounce(fn, overflowing)).toThrow(RangeError);
      });

      it("throws RangeError for non-numeric waitMs (string)", () => {
        const fn = vi.fn();
        // The type signature is `number`, but at runtime we exercise the guard
        // directly. A non-numeric value fails Number.isFinite.
        expect(() => debounce(fn, "abc" as unknown as number)).toThrow(
          RangeError,
        );
      });
    });

    describe("cancel() fallback (no pending timer)", () => {
      it("does not throw when cancel() is called before any invocation", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        expect(() => debounced.cancel()).not.toThrow();
        expect(fn).not.toHaveBeenCalled();
      });

      it("is a no-op when cancel() is called on an idle debounced twice", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        expect(() => {
          debounced.cancel();
          debounced.cancel();
        }).not.toThrow();

        vi.advanceTimersByTime(200);
        expect(fn).not.toHaveBeenCalled();
      });

      it("cancel() after the timer already fired is a safe no-op", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced("once");
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("once");

        // After the timeout callback ran, timeoutId is undefined. Calling
        // cancel() here must not throw and must not re-invoke fn.
        expect(() => debounced.cancel()).not.toThrow();
        vi.advanceTimersByTime(200);
        expect(fn).toHaveBeenCalledTimes(1);
      });

      it("cancel() between successive invocations only drops the pending one", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced("first");
        debounced.cancel();
        debounced("second");

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("second");
      });
    });

    describe("clearTimeout fallback on re-entry", () => {
      it("does not throw when setTimeout fires repeatedly into clearTimeout chains", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 50);

        // A burst of calls within the wait window. Each one schedules and then
        // gets cancelled by the next; the final one fires.
        debounced("a");
        vi.advanceTimersByTime(10);
        debounced("b");
        vi.advanceTimersByTime(10);
        debounced("c");
        vi.advanceTimersByTime(10);
        debounced("d");

        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(50);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("d");
      });
    });
  });
});
