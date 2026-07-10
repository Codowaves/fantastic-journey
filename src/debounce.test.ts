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

  it("waitMs of 0 fires on the next tick (boundary)", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 0);

    debounced("a");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("calling again after cancel schedules a fresh invocation", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    debounced.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    debounced("second");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("cancel is a no-op when no invocation is pending", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(() => debounced.cancel()).not.toThrow();
    debounced.cancel();
    debounced.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it("invokes the wrapped function with no arguments when called with none", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced();
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith();
  });

  it("independent debounced instances do not share state", () => {
    const fnA = vi.fn();
    const fnB = vi.fn();
    const debouncedA = debounce(fnA, 100);
    const debouncedB = debounce(fnB, 50);

    debouncedA("a");
    debouncedB("b");
    vi.advanceTimersByTime(50);

    expect(fnA).not.toHaveBeenCalled();
    expect(fnB).toHaveBeenCalledTimes(1);
    expect(fnB).toHaveBeenCalledWith("b");

    vi.advanceTimersByTime(50);
    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnA).toHaveBeenCalledWith("a");
  });
});
