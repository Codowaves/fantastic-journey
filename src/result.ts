/**
 * A discriminated union representing either a success (`Ok`) carrying a
 * value of type `T`, or a failure (`Err`) carrying an error of type `E`.
 *
 * Use {@link ok} and {@link err} to construct values, and {@link map} or
 * {@link unwrap} to work with them.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Wraps a value in an `Ok` variant of {@link Result}.
 *
 * @param value - The success value to wrap.
 * @returns A `Result` in the `Ok` state.
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Wraps an error in an `Err` variant of {@link Result}.
 *
 * @param error - The error value to wrap.
 * @returns A `Result` in the `Err` state.
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Transforms the success value of a {@link Result} by applying `fn` to it.
 *
 * If the result is `Err`, the error is passed through unchanged and `fn`
 * is never called.
 *
 * @param res - The result to transform.
 * @param fn - A function that maps the success value to a new value.
 * @returns A new `Result` with the mapped success value, or the original error.
 */
export function map<T, U, E>(
  res: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (res.ok) {
    return ok(fn(res.value));
  }
  return res;
}

/**
 * Returns the success value of a {@link Result}, or throws the contained
 * error if the result is `Err`.
 *
 * @param res - The result to unwrap.
 * @returns The success value when `res` is `Ok`.
 * @throws The contained error when `res` is `Err`.
 */
export function unwrap<T, E>(res: Result<T, E>): T {
  if (res.ok) {
    return res.value;
  }
  throw res.error;
}
