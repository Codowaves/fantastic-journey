/**
 * Returns a new array containing all but the first `n` elements of `arr`.
 *
 * @param arr - The array to drop elements from. Not mutated.
 * @param n - The number of leading elements to drop. Must be a non-negative integer.
 * @returns A new array containing the elements after the first `n`. Returns an empty array if `n` is greater than or equal to `arr.length`.
 * @throws {RangeError} If `n` is negative or not an integer.
 */
export function dropN<T>(arr: readonly T[], n: number): T[] {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`dropN: n must be a non-negative integer, got ${n}`);
  }
  return arr.slice(n);
}
