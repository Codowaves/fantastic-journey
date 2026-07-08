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

  it("waitMs = 0 fires on the next tick", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 0);

    debounced("x");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("x");
  });

  it("waitMs = -0 is treated as 0, not invalid", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, -0);

    debounced();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fn is never called when no invocations are made", () => {
    const fn = vi.fn();
    debounce(fn, 100);

    vi.advanceTimersByTime(10_000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel is a no-op when nothing is pending", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(() => debounced.cancel()).not.toThrow();
    debounced.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel after fire is a no-op", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("forwards multiple arguments", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, "two", { three: 3 });
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, "two", { three: 3 });
  });

  it("can be reused after a fired call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced("second");
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("second");
  });

  it("each debounced instance is independent", () => {
    const fnA = vi.fn();
    const fnB = vi.fn();
    const a = debounce(fnA, 100);
    const b = debounce(fnB, 200);

    a("a");
    b("b");

    vi.advanceTimersByTime(100);
    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnB).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fnB).toHaveBeenCalledTimes(1);
  });

  it("debounced function returns undefined", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(debounced("a")).toBeUndefined();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
