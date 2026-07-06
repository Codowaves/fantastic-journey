/**
 * Wraps `fn` so that successive calls within `waitMs` are coalesced into a
 * single invocation delayed by `waitMs` from the most recent call. The
 * returned function is also annotated with a `cancel` method that aborts any
 * pending invocation.
 *
 * @param fn - The function to invoke once the debounce window elapses.
 * @param waitMs - Non-negative finite delay in milliseconds before `fn` is
 *   invoked. Must be a finite number; throws `RangeError` otherwise.
 * @returns A debounced wrapper that forwards its arguments to `fn`, together
 *   with a `cancel` method to drop the pending invocation.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  waitMs: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
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
