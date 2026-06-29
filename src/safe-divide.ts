/**
 * Divides `a` by `b`, returning 0 for inputs that would yield NaN or Infinity.
 *
 * Non-finite inputs (NaN, Infinity, -Infinity) and division by zero return 0
 * rather than propagating non-finite numbers.
 *
 * @param a - The numerator.
 * @param b - The denominator.
 * @returns `a / b` when the result is finite, otherwise 0.
 */
export function safeDivide(a: number, b: number): number {
  const result = a / b;
  if (!Number.isFinite(result)) {
    return 0;
  }
  return result;
}
