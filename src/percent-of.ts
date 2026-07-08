/**
 * Computes what percentage `part` is of `whole`, returning 0 when `whole` is 0.
 *
 * @param part - The numerator (e.g. 25); must be a finite number
 * @param whole - The denominator total (e.g. 200); must be a finite number; if 0, returns 0 instead of NaN
 * @returns `part / whole * 100`, or 0 if `whole` is 0
 * @throws TypeError if `part` or `whole` is not a finite number (null, undefined, NaN, non-number)
 */
export function percentOf(part: number, whole: number): number {
  if (typeof part !== "number" || !Number.isFinite(part)) {
    throw new TypeError(
      `percentOf: 'part' must be a finite number, got ${String(part)}`,
    );
  }
  if (typeof whole !== "number" || !Number.isFinite(whole)) {
    throw new TypeError(
      `percentOf: 'whole' must be a finite number, got ${String(whole)}`,
    );
  }
  if (whole === 0) {
    return 0;
  }
  return (part / whole) * 100;
}
