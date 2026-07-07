/**
 * Computes what percentage `part` is of `whole`, returning 0 when `whole` is 0.
 *
 * @param part - The numerator (e.g. 25)
 * @param whole - The denominator total (e.g. 200); if 0, returns 0 instead of NaN
 * @returns `part / whole * 100`, or 0 if `whole` is 0
 */
export function percentOf(part: number, whole: number): number {
  if (whole === 0) {
    return 0;
  }
  return (part / whole) * 100;
}
