import { describe, it, expect, vi } from "vitest";
import { withRetry } from "./retry.js";
import { TransientError } from "./types.js";

describe("withRetry", () => {
  it("should return result on first success", async () => {
    const operation = vi.fn().mockResolvedValue("success");
    const result = await withRetry(operation);
    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry on retryable error", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new TransientError("Temporary failure"))
      .mockResolvedValueOnce("success");

    const result = await withRetry(operation, { initialDelayMs: 10 });
    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("should not retry on non-retryable error", async () => {
    const error = new Error("Non-retryable");
    const operation = vi.fn().mockRejectedValue(error);

    await expect(withRetry(operation)).rejects.toThrow("Non-retryable");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should respect max attempts", async () => {
    const operation = vi.fn().mockRejectedValue(new TransientError("Always fails"));

    await expect(withRetry(operation, { maxAttempts: 3, initialDelayMs: 10 })).rejects.toThrow(
      "Always fails",
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should use exponential backoff", async () => {
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;

    global.setTimeout = ((callback: () => void, delay: number) => {
      delays.push(delay);
      return originalSetTimeout(callback, 0);
    }) as typeof setTimeout;

    const operation = vi
      .fn()
      .mockRejectedValueOnce(new TransientError("Fail 1"))
      .mockRejectedValueOnce(new TransientError("Fail 2"))
      .mockResolvedValueOnce("success");

    await withRetry(operation, {
      maxAttempts: 3,
      initialDelayMs: 100,
      backoffMultiplier: 2,
    });

    global.setTimeout = originalSetTimeout;

    expect(delays).toHaveLength(2);
    expect(delays[0]).toBe(100);
    expect(delays[1]).toBe(200);
  });

  it("should respect max delay", async () => {
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;

    global.setTimeout = ((callback: () => void, delay: number) => {
      delays.push(delay);
      return originalSetTimeout(callback, 0);
    }) as typeof setTimeout;

    const operation = vi
      .fn()
      .mockRejectedValueOnce(new TransientError("Fail 1"))
      .mockRejectedValueOnce(new TransientError("Fail 2"))
      .mockResolvedValueOnce("success");

    await withRetry(operation, {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 1500,
      backoffMultiplier: 2,
    });

    global.setTimeout = originalSetTimeout;

    expect(delays).toHaveLength(2);
    expect(delays[0]).toBe(1000);
    expect(delays[1]).toBe(1500);
  });
});
