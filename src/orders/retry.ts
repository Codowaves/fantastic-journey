import { logger } from "./logger.js";
import type { OrderError } from "./types.js";

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      const isRetryable =
        (error as OrderError).retryable !== undefined
          ? (error as OrderError).retryable
          : false;

      if (!isRetryable || attempt >= opts.maxAttempts) {
        logger.error("Operation failed, no more retries", lastError, {
          attempt,
          maxAttempts: opts.maxAttempts,
        });
        throw lastError;
      }

      logger.warn("Operation failed, retrying", {
        attempt,
        maxAttempts: opts.maxAttempts,
        delayMs: delay,
        error: lastError.message,
      });

      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError!;
}
