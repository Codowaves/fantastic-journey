/**
 * Returns a memoized version of `fn` that caches results keyed by
 * JSON-serialized arguments. Repeated calls with the same args return
 * the cached result without re-invoking the underlying function.
 */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  if (fn === null || fn === undefined) {
    throw new TypeError("fn must be a function");
  }
  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }
  if (Number.isNaN(fn as unknown as number)) {
    throw new TypeError("fn must be a function");
  }
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
