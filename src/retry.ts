/**
 * Configuration options for the retry helper.
 */
export interface RetryOptions {
  /** Total number of attempts (including the first try). Default: 3 */
  attempts?: number;
  /** Initial backoff delay in milliseconds. Default: 100 */
  baseDelayMs?: number;
  /** Backoff multiplier for exponential delay. Default: 2 */
  factor?: number;
}

/**
 * Retries an async function with exponential backoff.
 *
 * On failure, waits `baseDelayMs * factor^(attempt-1)` before retrying.
 * With defaults (baseDelayMs=100, factor=2), delays are: 100ms, 200ms, 400ms, ...
 *
 * @param fn - The async function to retry.
 * @param options - Retry configuration.
 * @returns The result of the first successful invocation.
 * @throws The error from the final failed attempt if all retries are exhausted.
 * @throws RangeError if `attempts` is less than 1.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }

  if (
    options !== undefined &&
    (options === null || typeof options !== "object")
  ) {
    throw new TypeError("options must be an object");
  }

  const attempts = options?.attempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 100;
  const factor = options?.factor ?? 2;

  if (typeof attempts !== "number" || Number.isNaN(attempts)) {
    throw new TypeError("attempts must be a finite number");
  }
  if (typeof baseDelayMs !== "number" || Number.isNaN(baseDelayMs)) {
    throw new TypeError("baseDelayMs must be a finite number");
  }
  if (typeof factor !== "number" || Number.isNaN(factor)) {
    throw new TypeError("factor must be a finite number");
  }

  if (
    !Number.isFinite(attempts) ||
    !Number.isFinite(baseDelayMs) ||
    !Number.isFinite(factor)
  ) {
    throw new RangeError(
      "attempts, baseDelayMs, and factor must be finite numbers",
    );
  }

  if (attempts < 1) {
    throw new RangeError("attempts must be at least 1");
  }
  if (baseDelayMs < 0) {
    throw new RangeError("baseDelayMs must be non-negative");
  }
  if (factor < 0) {
    throw new RangeError("factor must be non-negative");
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        const delayMs = baseDelayMs * Math.pow(factor, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}
