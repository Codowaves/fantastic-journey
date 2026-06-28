/**
 * Returns a new array with all falsy values (`false`, `null`, `0`, `""`,
 * `undefined`, `NaN`) removed. Truthy values are preserved in their original
 * order.
 *
 * @param array - The array to compact. Not mutated.
 * @returns A new array containing only the truthy elements.
 */
export function compact<T>(
  array: readonly (T | null | undefined | false | 0 | "")[],
): T[] {
  const result: T[] = [];
  for (const value of array) {
    if (value) {
      result.push(value as T);
    }
  }
  return result;
}
