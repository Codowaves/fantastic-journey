/**
 * Rotates the elements of `arr` to the left by `n` positions. The rotation wraps
 * around the end of the array, so the first `n` elements move to the end. The
 * input array is not mutated.
 *
 * @param arr - The array to rotate. Not mutated.
 * @param n - The number of positions to rotate left by. May be negative
 *   (rotates right) or larger than the array length (wraps). Non-integer values
 *   are truncated toward zero.
 * @returns A new array containing the rotated elements. Returns a copy of
 *   `arr` when `n` is a multiple of the array length (including zero) or when
 *   the array is empty.
 * @throws {RangeError} If `n` is `NaN` or non-finite.
 */
export function rotateArray<T>(arr: readonly T[], n: number): T[] {
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    throw new RangeError(`rotateArray: n must be a finite number, got ${n}`);
  }
  const len = arr.length;
  if (len === 0) return [];
  const shift = Math.trunc(n);
  const offset = ((shift % len) + len) % len;
  if (offset === 0) return arr.slice();
  return arr.slice(offset).concat(arr.slice(0, offset));
}
