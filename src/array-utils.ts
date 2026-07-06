/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 *
 * @param arr - The input array from which to remove duplicates.
 * @returns A new array containing only the first occurrence of each value from the input.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
