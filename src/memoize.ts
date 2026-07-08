/**
 * Returns a memoized version of `fn` that caches results keyed by
 * JSON-serialized arguments. Repeated calls with the same args return
 * the cached result without re-invoking the underlying function.
 *
 * @typeParam A - The tuple type of the wrapped function's arguments.
 * @typeParam R - The wrapped function's return type.
 * @param fn - The function whose results should be cached. Invoked at most
 *   once per distinct JSON-serialized argument list.
 * @returns A new function with the same signature as `fn` that returns the
 *   cached result on repeated calls with the same args.
 *
 * @example
 * const square = memoize((n: number) => n * n);
 * square(4);
 * // 16
 * square(4);
 * // 16 (returned from cache; underlying fn not called again)
 * const sum = memoize((a: number, b: number) => a + b);
 * sum(1, 2);
 * // 3
 * sum(2, 1);
 * // 3 (different args JSON, so the underlying fn runs again)
 */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as R;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
