import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { retry } from "./retry";

describe("retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the result immediately on success", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");

    const promise = retry(mockFn);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("retries with exponential backoff after failures", async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce("success");

    const promise = retry(mockFn, { attempts: 3, baseDelayMs: 100, factor: 2 });

    // First attempt fails immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Wait for first backoff: 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Wait for second backoff: 200ms
    await vi.advanceTimersByTimeAsync(200);
    expect(mockFn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe("success");
  });

  it("rejects with the last error after exhausting all attempts", async () => {
    const error1 = new Error("fail 1");
    const error2 = new Error("fail 2");
    const error3 = new Error("fail 3");

    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2)
      .mockRejectedValueOnce(error3);

    const promise = retry(mockFn, { attempts: 3 });
    promise.catch(() => {}); // Prevent unhandled rejection

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow("fail 3");
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it("throws RangeError when attempts is less than 1", async () => {
    const mockFn = vi.fn();

    await expect(retry(mockFn, { attempts: 0 })).rejects.toThrow(RangeError);
    await expect(retry(mockFn, { attempts: -1 })).rejects.toThrow(RangeError);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("does not retry when attempts is 1", async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error("fail"));

    const promise = retry(mockFn, { attempts: 1 });
    promise.catch(() => {}); // Prevent unhandled rejection
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow("fail");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("does not invoke fn again after success", async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockResolvedValueOnce("success")
      .mockResolvedValueOnce("should not reach");

    const promise = retry(mockFn, { attempts: 5 });
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("uses default options when not specified", async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce("success");

    const promise = retry(mockFn);

    await vi.advanceTimersByTimeAsync(0);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Default baseDelayMs is 100, factor is 2
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(200);
    expect(mockFn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe("success");
  });

  it("respects custom backoff parameters", async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce("success");

    const promise = retry(mockFn, {
      attempts: 3,
      baseDelayMs: 50,
      factor: 3,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // First backoff: 50 * 3^0 = 50ms
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Second backoff: 50 * 3^1 = 150ms
    await vi.advanceTimersByTimeAsync(150);
    expect(mockFn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe("success");
  });
});
