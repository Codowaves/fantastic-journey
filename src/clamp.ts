/**
 * Constrains `n` to the inclusive range [`min`, `max`].
 *
 * @param n - The value to clamp.
 * @param min - The lower bound of the range.
 * @param max - The upper bound of the range.
 * @returns `n` if it lies within the range, otherwise the nearest bound.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
