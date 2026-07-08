/**
 * Returns a wrapped function that invokes `fn` at most once.
 * Subsequent calls return the cached result from the first invocation
 * without re-running the underlying function.
 */
export function onceFn<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R | undefined {
  if (fn === null || fn === undefined) {
    throw new TypeError("fn must be a function");
  }
  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }
  if (Number.isNaN(fn as unknown as number)) {
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
