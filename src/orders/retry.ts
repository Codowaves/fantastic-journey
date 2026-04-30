export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export class RetryExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryExhaustedError";
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let delay = opts.initialDelayMs;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === opts.maxAttempts - 1) {
        throw new RetryExhaustedError(
          `Failed after ${attempt + 1} attempts: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }
  throw new Error("unreachable");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(err: unknown): boolean {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ECONNRESET") ||
      message.includes("network") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("429")
    );
  }
  return false;
}
