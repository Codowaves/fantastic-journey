/**
 * Returns a memoized version of `fn` that caches results keyed by
 * JSON-serialized arguments. Repeated calls with the same args return
 * the cached result without re-invoking the underlying function.
 *
 * @example
 * const slowSquare = (n: number) => {
 *   console.log('computing');
 *   return n * n;
 * };
 * const memoizedSquare = memoize(slowSquare);
 * memoizedSquare(4); // logs 'computing', returns 16
 * memoizedSquare(4); // returns 16 (cache hit, no log)
 * memoizedSquare(5); // logs 'computing', returns 25
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
