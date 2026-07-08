/**
 * Rounds `n` to `dp` decimal places using standard half-away-from-zero rounding.
 *
 * @param n - The number to round.
 * @param dp - The number of decimal places to keep. Must be a non-negative integer.
 * @returns `n` rounded to `dp` decimals.
 *
 * @example
 * roundTo(1.2345, 2); // 1.23
 * roundTo(1.2355, 2); // 1.24 (half-away-from-zero)
 * roundTo(5, 0);      // 5
 */
export function roundTo(n: number, dp: number): number {
  const factor = 10 ** dp;
  return Math.round(n * factor) / factor;
}
