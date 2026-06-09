/**
 * Returns a debounced wrapper around `fn`. The wrapped function delays invoking
 * `fn` until `ms` milliseconds have elapsed since the last invocation.
 *
 * - With the default options (`leading: false`, `trailing: true`), the call
 *   is scheduled after the wait period and any pending call is cancelled when
 *   the wrapper is re-invoked within the window.
 * - With `leading: true`, `fn` is invoked immediately on the first call, and
 *   subsequent calls within the window are ignored (rate-limited).
 *
 * @param fn - The function to debounce.
 * @param ms - The debounce window in milliseconds.
 * @param opts - Optional behavior flags. `leading` invokes on the first call;
 *   `trailing` invokes after the wait period. Defaults: `{ leading: false, trailing: true }`.
 * @returns A debounced version of `fn` that shares the same argument list.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
  opts?: { leading?: boolean; trailing?: boolean },
): (...args: A) => void {
  const leading = opts?.leading ?? false;
  const trailing = opts?.trailing ?? true;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  return function debounced(...args: A): void {
    lastArgs = args;
    const isFirstCall = timer === null;
    const callNow = leading && isFirstCall;
    if (timer !== null) clearTimeout(timer);
    if (callNow) {
      fn(...args);
      lastArgs = null;
    }
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs !== null) {
        const a = lastArgs;
        lastArgs = null;
        fn(...a);
      }
    }, ms);
  };
}
