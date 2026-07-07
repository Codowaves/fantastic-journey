/**
 * Constrains `n` to the inclusive range [`lo`, `hi`].
 *
 * @param n - The value to clamp.
 * @param lo - The lower bound of the range.
 * @param hi - The upper bound of the range.
 * @returns `n` if it lies within the range, otherwise the nearest bound.
 * @throws {TypeError} If any argument is null, undefined, or NaN.
 * @throws {RangeError} If `lo` is greater than `hi`.
 */
export function clamp(n: number, lo: number, hi: number): number {
  if (n === null || n === undefined || Number.isNaN(n)) {
    throw new TypeError("n must be a finite number");
  }
  if (lo === null || lo === undefined || Number.isNaN(lo)) {
    throw new TypeError("lo must be a finite number");
  }
  if (hi === null || hi === undefined || Number.isNaN(hi)) {
    throw new TypeError("hi must be a finite number");
  }
  if (lo > hi) {
    throw new RangeError("lo must be <= hi");
  }
  return Math.min(Math.max(n, lo), hi);
}
