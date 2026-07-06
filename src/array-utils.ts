/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 *
 * @param arr - The input array to deduplicate.
 * @returns A new array containing only the first occurrence of each value.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
