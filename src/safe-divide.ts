/**
 * Divides `a` by `b`, returning `0` when `b` is `0` instead of producing
 * `Infinity`, `-Infinity`, or `NaN`.
 *
 * @param a - The numerator.
 * @param b - The denominator.
 * @returns `a / b` when `b` is non-zero; otherwise `0`.
 */
export function safeDivide(a: number, b: number): number {
  if (b === 0) {
    return 0;
  }
  return a / b;
}
