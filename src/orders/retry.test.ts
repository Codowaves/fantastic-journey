import { describe, it, expect, vi } from "vitest";
import { withRetry, RetryExhaustedError, isRetryableError } from "./retry.js";

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { maxAttempts: 3 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("ok");
    const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws RetryExhaustedError after max attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));
    await expect(
      withRetry(fn, { maxAttempts: 2, initialDelayMs: 5 }),
    ).rejects.toThrow(RetryExhaustedError);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("isRetryableError", () => {
  it("recognizes timeout errors", () =>
    expect(isRetryableError(new Error("connection timeout"))).toBe(true));
  it("recognizes network errors", () =>
    expect(isRetryableError(new Error("network error"))).toBe(true));
  it("recognizes 503 errors", () =>
    expect(isRetryableError(new Error("service unavailable 503"))).toBe(true));
  it("recognizes 429 errors", () =>
    expect(isRetryableError(new Error("rate limited 429"))).toBe(true));
  it("returns false for non-retryable errors", () =>
    expect(isRetryableError(new Error("invalid input"))).toBe(false));
  it("returns false for non-Error values", () =>
    expect(isRetryableError("string error")).toBe(false));
});
