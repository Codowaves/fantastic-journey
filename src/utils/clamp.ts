/**
 * Constrain a number to the inclusive range [min, max].
 *
 * Returns `n` unchanged when it already falls within the range, `min` when it
 * is below the range, and `max` when it is above it.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
