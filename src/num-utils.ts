/**
 * Constrains `n` to the inclusive range [`min`, `max`].
 *
 * The bounds themselves are returned when `n` equals `min` or `max`.
 * The function does NOT validate that `min <= max`; if `min > max`, the
 * expression still proceeds but the "range" is effectively inverted — the
 * caller is expected to pass ordered bounds.
 *
 * @param n - The value to clamp.
 * @param min - The lower bound of the range (inclusive).
 * @param max - The upper bound of the range (inclusive).
 * @returns `n` if it lies within the range, otherwise `min` when below or
 *   `max` when above.
 *
 * @example
 * clamp(5, 0, 10);    // 5  (within range)
 * clamp(-3, 0, 10);   // 0  (below range, returns min)
 * clamp(99, 0, 10);   // 10 (above range, returns max)
 *
 * @example
 * // Edge case: negative-only range
 * clamp(-5, -10, -1);   // -5  (within range)
 * clamp(-15, -10, -1);  // -10 (below range)
 * clamp(0, -10, -1);    // -1  (above range)
 *
 * @example
 * // Edge case: min equals max collapses to a single value
 * clamp(7, 7, 7);   // 7
 * clamp(5, 7, 7);   // 7
 *
 * @example
 * // Edge case: fractional bounds and values are handled natively
 * clamp(2.5, 1.0, 3.0);   // 2.5 (within range)
 * clamp(0.5, 1.0, 3.0);   // 1.0 (below range)
 * clamp(3.5, 1.0, 3.0);   // 3.0 (above range)
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
