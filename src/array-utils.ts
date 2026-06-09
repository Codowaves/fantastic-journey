/**
 * Returns a new array with duplicate values removed, preserving the order
 * of first occurrence.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
