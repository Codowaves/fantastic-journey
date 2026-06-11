/**
 * Constrains `n` to the inclusive range [`min`, `max`].
 *
 * @param n - The value to clamp.
 * @param min - The lower bound of the range.
 * @param max - The upper bound of the range.
 * @returns `n` if it lies within the range, otherwise the nearest bound.
 * @throws {RangeError} If `min > max`.
 *
 * NaN handling: If `n` is NaN, returns NaN (follows standard Math.min/max behavior).
 * If `min` or `max` is NaN, the result is NaN.
 */
export function clamp(n: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(
      `Invalid range: min (${min}) cannot be greater than max (${max})`,
    );
  }
  return Math.min(Math.max(n, min), max);
}
