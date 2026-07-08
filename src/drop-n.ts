/**
 * Returns a new array containing all but the first `n` elements of `arr`.
 *
 * @param arr - The array to drop elements from. Not mutated.
 * @param n - The number of leading elements to drop. Must be a non-negative integer.
 * @returns A new array containing the elements after the first `n`. Returns an empty array if `n` is greater than or equal to `arr.length`.
 * @throws {TypeError} If `arr` is null/undefined or `n` is null/undefined/NaN.
 * @throws {RangeError} If `n` is negative or not an integer.
 *
 * @example
 * dropN([1, 2, 3, 4, 5], 2); // [3, 4, 5]
 * dropN([1, 2, 3], 0); // [1, 2, 3]
 * dropN([1, 2, 3], 3); // []
 * dropN([1, 2, 3], 10); // []
 * dropN([], 0); // []
 * dropN([1, 2, 3], -1); // throws RangeError
 * dropN([1, 2, 3], 1.5); // throws RangeError
 * dropN(null as unknown as number[], 1); // throws TypeError
 * dropN([1, 2, 3], Number.NaN); // throws TypeError
 */
export function dropN<T>(arr: readonly T[], n: number): T[] {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (n === null || n === undefined || Number.isNaN(n)) {
    throw new TypeError("n must be a number");
  }
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`dropN: n must be a non-negative integer, got ${n}`);
  }
  return arr.slice(n);
}
