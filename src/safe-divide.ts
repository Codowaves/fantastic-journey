/**
 * Divides `a` by `b`, returning 0 for inputs that would yield NaN or Infinity.
 *
 * Non-finite inputs (NaN, Infinity, -Infinity) and division by zero return 0
 * rather than propagating non-finite numbers.
 *
 * @param a - The numerator.
 * @param b - The denominator.
 * @returns `a / b` when the result is finite, otherwise 0.
 *
 * @example
 * safeDivide(10, 2);   // 5
 * safeDivide(10, 0);   // 0  (division by zero)
 * safeDivide(NaN, 2);  // 0  (non-finite numerator)
 * safeDivide(1, 0);    // 0  (result would be Infinity)
 *
 * Edge cases:
 * - `b === 0` returns 0 instead of `Infinity` / `-Infinity` / `NaN`.
 * - `NaN` in either argument returns 0 instead of `NaN`.
 * - `Infinity` or `-Infinity` as the numerator returns 0 (the division
 *   of an infinite numerator by any finite non-zero number is still infinite).
 * - `Infinity / 0` returns 0 instead of `NaN`.
 */
export function safeDivide(a: number, b: number): number {
  const result = a / b;
  if (!Number.isFinite(result)) {
    return 0;
  }
  return result;
}
