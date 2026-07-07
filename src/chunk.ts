/**
 * Splits `arr` into consecutive sub-arrays of length `size`. The final chunk
 * may be shorter than `size` if `arr.length` is not a multiple of `size`.
 *
 * @param arr - The array to split. Not mutated.
 * @param size - The maximum length of each chunk. Must be a positive integer.
 * @returns A new array of chunks. Returns an empty array if `arr` is empty.
 * @throws {RangeError} If `size` is not a positive integer.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * chunk(['a', 'b', 'c', 'd'], 3); // [['a', 'b', 'c'], ['d']]
 * chunk([], 3); // []
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(`chunk: size must be a positive integer, got ${size}`);
  }
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
