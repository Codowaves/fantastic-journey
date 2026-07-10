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

  it("throws TypeError when fn is null or undefined", () => {
    expect(() => debounce(null as unknown as () => void, 100)).toThrow(
      TypeError,
    );
    expect(() => debounce(undefined as unknown as () => void, 100)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when fn is NaN", () => {
    expect(() => debounce(Number.NaN as unknown as () => void, 100)).toThrow(
      TypeError,
    );
  });
});
