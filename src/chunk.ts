/**
 * Splits `arr` into an array of sub-arrays, each of length `size`. The final
 * chunk may be shorter than `size` when `arr.length` is not a multiple of
 * `size`.
 *
 * @param arr - The array to split.
 * @param size - The desired length of each chunk. Must be at least 1.
 * @returns A new array containing the chunks.
 * @throws RangeError when `size` is less than 1.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) {
    throw new RangeError("chunk: size must be at least 1");
  }
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
