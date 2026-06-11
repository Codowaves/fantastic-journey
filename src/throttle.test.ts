import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("first call executes immediately (leading edge)", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("hello");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("hello");
  });

  it("subsequent calls within window are dropped", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("first");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled("second");
    expect(fn).toHaveBeenCalledTimes(1); // Still only called once

    vi.advanceTimersByTime(40);
    throttled("third");
    expect(fn).toHaveBeenCalledTimes(1); // Still only called once
  });

  it("last args win on trailing edge", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("first");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");

    vi.advanceTimersByTime(50);
    throttled("second");

    vi.advanceTimersByTime(30);
    throttled("third");

    // At this point, 80ms have passed. Wait for trailing call at 100ms.
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("third");
  });

  it("allows calls after window expires", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("first");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    throttled("second");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("handles multiple throttle windows correctly", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    // First window
    throttled("call1");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled("call2");

    vi.advanceTimersByTime(50); // Trailing edge fires
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("call2");

    // Second window
    vi.advanceTimersByTime(50);
    throttled("call3");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith("call3");
  });

  it("single call with no subsequent calls has no trailing edge", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("only");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1); // No trailing call
  });

  it("preserves function arguments correctly", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("arg1", "arg2", "arg3");
    expect(fn).toHaveBeenCalledWith("arg1", "arg2", "arg3");

    vi.advanceTimersByTime(50);
    throttled("new1", "new2");

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("new1", "new2");
  });

  it("throws RangeError for negative waitMs", () => {
    const fn = vi.fn();
    expect(() => throttle(fn, -1)).toThrow(RangeError);
  });

  it("throws RangeError for non-finite waitMs", () => {
    const fn = vi.fn();
    expect(() => throttle(fn, Infinity)).toThrow(RangeError);
    expect(() => throttle(fn, NaN)).toThrow(RangeError);
  });

  it("works with zero waitMs", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 0);

    throttled("first");
    expect(fn).toHaveBeenCalledTimes(1);

    throttled("second");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
