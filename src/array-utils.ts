/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 *
 * @param arr - The input array from which to remove duplicates.
 * @returns A new array containing only the unique values from `arr`,
 *          in the order they first appeared.
 * @throws {TypeError} If `arr` is null, undefined, NaN, or not an array.
 *
 * @example
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 * unique(['a', 'b', 'a']); // ['a', 'b']
 */
export function unique<T>(arr: T[]): T[] {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (typeof arr === "number" && Number.isNaN(arr)) {
    throw new TypeError("arr must be an array");
  }
  if (!Array.isArray(arr)) {
    throw new TypeError("arr must be an array");
  }
  return [...new Set(arr)];
}
