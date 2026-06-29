/**
 * Returns a new array containing only the truthy values from `arr`.
 *
 * @typeParam T - The element type of `arr`.
 * @param arr - The array to filter.
 * @returns A new array with all falsy values removed.
 */
export function compact<T>(arr: readonly T[]): T[] {
  const result: T[] = [];
  for (const value of arr) {
    if (value) {
      result.push(value);
    }
  }
  return result;
}
