/**
 * Options controlling {@link retry}'s backoff behavior.
 */
export interface RetryOptions {
  /** Maximum number of attempts (default 3). Must be >= 1. */
  retries?: number;
  /** Initial delay in ms before the first retry (default 50). */
  delayMs?: number;
  /** Multiplier applied to the delay after each failed attempt (default 2). */
  factor?: number;
}

/**
 * Calls `fn` and retries it on rejection with exponential backoff.
 *
 * The first attempt runs immediately. After a failure, waits `delayMs` ms
 * before retrying, then `delayMs * factor` ms, then `delayMs * factor^2`, etc.
 * If all `retries` attempts fail, the last error is rethrown.
 *
 * @param fn - The async function to invoke.
 * @param opts - Backoff configuration. Defaults to `{ retries: 3, delayMs: 50, factor: 2 }`.
 * @returns The resolved value of `fn` from the first successful attempt.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions,
): Promise<T> {
  const retries = opts?.retries ?? 3;
  const delayMs = opts?.delayMs ?? 50;
  const factor = opts?.factor ?? 2;

  let lastError: unknown;
  let delay = delayMs;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= factor;
      }
    }
  }

  throw lastError;
}
