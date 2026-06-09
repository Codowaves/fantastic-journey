import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes fn after the wait period (trailing, default)", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("cancels the pending call when re-invoked within the window", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("rapid re-invocation coalesces into a single trailing call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced("b");
    debounced("c");
    debounced("d");
    debounced("e");

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("e");
  });

  it("leading: true invokes immediately and suppresses calls within the window", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100, { leading: true, trailing: true });

    debounced("a");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");

    debounced("b");
    debounced("c");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c");
  });

  it("leading: true with trailing: false fires only on the first call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100, { leading: true, trailing: false });

    debounced("a");
    debounced("b");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced("c");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c");
  });

  it("trailing: false with leading: false fires neither leading nor trailing", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100, { leading: false, trailing: false });

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it("passes the latest arguments to the trailing call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, 2);
    debounced(3, 4);
    debounced(5, 6);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(5, 6);
  });
});
