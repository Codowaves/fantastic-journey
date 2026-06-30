/**
 * Constrains `n` to the inclusive range [`lo`, `hi`].
 *
 * @param n - The value to clamp.
 * @param lo - The lower bound of the range.
 * @param hi - The upper bound of the range.
 * @returns `n` if it lies within the range, otherwise the nearest bound.
 */
export function clampToRange(n: number, lo: number, hi: number): number {
  if (lo > hi) {
    throw new RangeError("min must be <= max");
  }
  return Math.min(Math.max(n, lo), hi);
}
