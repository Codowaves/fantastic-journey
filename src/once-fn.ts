/**
 * Returns a wrapped function that invokes `fn` at most once.
 * Subsequent calls return the cached result from the first invocation
 * without re-running the underlying function.
 *
 * @param fn - The function to invoke at most once. Must not be null,
 *   undefined, or NaN.
 * @returns A wrapper that invokes `fn` only on the first call and returns
 *   the cached result thereafter.
 * @throws TypeError when `fn` is null, undefined, or NaN.
 */
export function onceFn<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R | undefined {
  if (
    fn === null ||
    fn === undefined ||
    (typeof fn === "number" && Number.isNaN(fn))
  ) {
    throw new TypeError("fn must be a function");
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
