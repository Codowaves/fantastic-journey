/**
 * Returns a version of `fn` that runs at most once and caches its return value.
 * The first call invokes `fn` with the provided arguments and stores the result.
 * All subsequent calls return the cached result without re-invoking `fn`,
 * regardless of arguments.
 */
export function once<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  let called = false;
  let result: R;

  return (...args: A): R => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
}
