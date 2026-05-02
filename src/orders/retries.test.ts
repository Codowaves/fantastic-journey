import { describe, it, expect } from "vitest";
import { withRetry, isRetryable } from "./retries.js";
import { TransientFailureError } from "./errors.js";

describe("retries", () => {
  it("returns result on success", async () => {
    const result = await withRetry(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it("throws non-retryable error immediately", async () => {
    await expect(
      withRetry(() => {
        throw new Error("non-retryable");
      })
    ).rejects.toThrow("non-retryable");
  });

  it("retries retryable TransientFailureError", async () => {
    let attempts = 0;
    await expect(
      withRetry(
        () => {
          attempts++;
          if (attempts < 3) {
            throw new TransientFailureError("transient", true);
          }
          return Promise.resolve("success");
        },
        { maxRetries: 3, baseDelayMs: 10 }
      )
    ).resolves.toBe("success");
    expect(attempts).toBe(3);
  });

  it("throws after max retries exhausted", async () => {
    let attempts = 0;
    await expect(
      withRetry(
        () => {
          attempts++;
          throw new TransientFailureError("transient", true);
        },
        { maxRetries: 2, baseDelayMs: 10 }
      )
    ).rejects.toThrow("transient");
    expect(attempts).toBe(3);
  });

  it("does not retry non-retryable TransientFailureError", async () => {
    let attempts = 0;
    await expect(
      withRetry(
        () => {
          attempts++;
          throw new TransientFailureError("not retryable", false);
        },
        { maxRetries: 3, baseDelayMs: 10 }
      )
    ).rejects.toThrow("not retryable");
    expect(attempts).toBe(1);
  });

  it("isRetryable returns true for retryable TransientFailureError", () => {
    expect(isRetryable(new TransientFailureError("x", true))).toBe(true);
  });

  it("isRetryable returns false for non-retryable TransientFailureError", () => {
    expect(isRetryable(new TransientFailureError("x", false))).toBe(false);
  });
});