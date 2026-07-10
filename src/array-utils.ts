/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 *
 * @param arr - The input array from which to remove duplicates. Must be an array.
 * @returns A new array containing only the unique values from `arr`,
 *          in the order they first appeared.
 * @throws {TypeError} If `arr` is not an array.
 *
 * @example
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 * unique(['a', 'b', 'a']); // ['a', 'b']
 */
export function unique<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) {
    throw new TypeError("unique expects an array");
  }
  return [...new Set(arr)];
}
