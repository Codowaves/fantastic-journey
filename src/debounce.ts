/**
 * Returns a debounced wrapper around `fn` that delays invocation until
 * `waitMs` milliseconds have elapsed since the most recent call. The returned
 * function exposes a `cancel()` method to discard any pending invocation.
 *
 * @param fn The function to invoke after the debounce window settles.
 * @param waitMs The debounce delay in milliseconds. Must be a non-negative
 *   finite number.
 * @returns A callable that forwards its arguments to `fn`, augmented with a
 *   `cancel()` method that drops any pending invocation.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  waitMs: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  if (fn === null || fn === undefined) {
    throw new TypeError("fn must be a function");
  }
  if (typeof fn !== "function") {
    throw new TypeError(`fn must be a function, got ${typeof fn}`);
  }
  if (waitMs === null || waitMs === undefined) {
    throw new TypeError("waitMs must be a number");
  }
  if (!Number.isFinite(waitMs) || waitMs < 0) {
    throw new RangeError("waitMs must be a non-negative finite number");
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = function (...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = undefined;
    }, waitMs);
  };

  debounced.cancel = function () {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}
