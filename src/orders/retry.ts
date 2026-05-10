import { TransientError } from "./errors.js";
import { recordRetry } from "./metrics.js";
import { logger } from "./logger.js";

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  shouldRetry?: (error: Error) => boolean;
}

const defaultConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  shouldRetry: (error) => error instanceof TransientError || isTransientError(error),
};

function isTransientError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("unavailable") ||
    message.includes("rate limit")
  );
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const shouldRetry = finalConfig.shouldRetry?.(lastError) ?? false;
      const isLastAttempt = attempt === finalConfig.maxAttempts;

      if (!shouldRetry || isLastAttempt) {
        logger.error(
          { operation: operationName, attempt, error: lastError.message },
          `Operation failed after ${attempt} attempt(s)`,
        );
        throw lastError;
      }

      const delayMs = calculateDelay(attempt, finalConfig);
      recordRetry(operationName, attempt);

      logger.warn(
        {
          operation: operationName,
          attempt,
          nextAttemptIn: delayMs,
          error: lastError.message,
        },
        `Retrying operation after transient error`,
      );

      await sleep(delayMs);
    }
  }

  throw lastError || new Error("Retry failed with no error");
}
