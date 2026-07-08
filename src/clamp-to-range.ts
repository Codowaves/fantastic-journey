/**
 * Constrains `n` to the inclusive range [`lo`, `hi`].
 *
 * Both bounds are inclusive: when `n` equals `lo` or `hi`, it is returned
 * unchanged. When `lo > hi`, no value can satisfy the range, so the
 * function throws rather than silently swapping the bounds.
 *
 * @param n - The value to clamp.
 * @param lo - The lower bound of the range (inclusive).
 * @param hi - The upper bound of the range (inclusive).
 * @returns `n` if it lies within the range, otherwise the nearest bound.
 * @throws {RangeError} If `lo > hi`.
 *
 * @example
 * clampToRange(5, 0, 10);
 * // 5
 * clampToRange(-3, 0, 10);
 * // 0
 * clampToRange(15, 0, 10);
 * // 10
 *
 * @example
 * // Negative ranges work the same way as positive ones:
 * clampToRange(-5, -10, -1);
 * // -5
 *
 * @example
 * // A zero-width range (`lo === hi`) always returns the bound:
 * clampToRange(42, 3, 3);
 * // 3
 *
 * @example
 * // Floating-point values are clamped just like integers:
 * clampToRange(1.5, 0, 2);
 * // 1.5
 */
export function clampToRange(n: number, lo: number, hi: number): number {
  if (lo > hi) {
    throw new RangeError("min must be <= max");
  }
  return Math.min(Math.max(n, lo), hi);
}
