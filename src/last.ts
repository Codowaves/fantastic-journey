/**
 * Returns the last element of `arr`, or `undefined` if the array is empty.
 *
 * @param arr - The array to read from.
 * @returns The final element of `arr`, or `undefined` when `arr` is empty.
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}
