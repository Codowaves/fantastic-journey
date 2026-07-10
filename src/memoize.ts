/**
 * Returns a memoized version of `fn` that caches results keyed by
 * JSON-serialized arguments. Repeated calls with the same args return
 * the cached result without re-invoking the underlying function.
 *
 * @typeParam A - The argument tuple type accepted by `fn`.
 * @typeParam R - The return type of `fn`.
 * @param fn - The function to memoize.
 * @returns A wrapper that returns the cached result for previously seen
 *   args and delegates to `fn` for new ones.
 *
 * @example
 * const slow = (n: number) => {
 *   // expensive work here
 *   return n * 2;
 * };
 * const fast = memoize(slow);
 * fast(3);
 * // 6
 * fast(3);
 * // 6 (returned from cache; `slow` is not called a second time)
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
