/**
 * Returns a wrapped function that invokes `fn` at most once.
 * Subsequent calls return the cached result from the first invocation
 * without re-running the underlying function.
 *
 * Throws when `fn` is `null`, `undefined`, or not a function.
 *
 * @param fn - The function to wrap; called only on the first invocation.
 * @returns A function that forwards to `fn` on its first call and returns
 *   the cached result on every subsequent call.
 */
export function onceFn<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R | undefined {
  if (fn === null || fn === undefined) {
    throw new TypeError(
      `onceFn: fn must be a function, got ${fn === null ? "null" : "undefined"}`,
    );
  }
  if (typeof fn !== "function") {
    throw new TypeError(`onceFn: fn must be a function, got ${typeof fn}`);
  }
  let called = false;
  let result: R | undefined;
  return (...args: A): R | undefined => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
