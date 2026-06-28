/**
 * Returns the first `n` elements of `arr`. If `arr.length` is less than `n`,
 * returns all available elements. Returns an empty array when `n` is non-positive.
 *
 * @param arr - The array to read from. Not mutated.
 * @param n - The maximum number of elements to return.
 * @returns A new array containing up to the first `n` elements of `arr`.
 */
export function take<T>(arr: readonly T[], n: number): T[] {
  if (n <= 0) return [];
  return arr.slice(0, n);
}
