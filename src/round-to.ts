/**
 * Rounds `n` to `dp` decimal places using standard half-away-from-zero rounding.
 *
 * @param n - The number to round.
 * @param dp - The number of decimal places to keep. Must be a non-negative integer.
 * @returns `n` rounded to `dp` decimals.
 */
export function roundTo(n: number, dp: number): number {
  const factor = 10 ** dp;
  return Math.round(n * factor) / factor;
}
