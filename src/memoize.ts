/**
 * Returns a memoized version of `fn` that caches results keyed by
 * JSON-serialized arguments. Repeated calls with the same args return
 * the cached result without re-invoking the underlying function.
 *
 * @example
 * const slowSquare = (n: number) => n * n;
 * const square = memoize(slowSquare);
 * square(5); // 25 (computes)
 * square(5); // 25 (cached)
 *
 * const add = memoize((a: number, b: number) => a + b);
 * add(1, 2); // 3 (computes)
 * add(1, 2); // 3 (cached)
 * add(2, 1); // 3 (separate cache entry — args are JSON-serialized)
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
