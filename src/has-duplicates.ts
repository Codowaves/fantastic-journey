/**
 * Checks whether an array contains any duplicate values.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to inspect. Not mutated.
 * @returns `true` if any value appears more than once, `false` otherwise.
 *
 * @example
 * hasDuplicates([1, 2, 3, 4]);
 * // false
 * hasDuplicates([1, 2, 3, 1]);
 * // true
 * hasDuplicates([]);
 * // false
 */
export function hasDuplicates<T>(arr: readonly T[]): boolean {
  const seen = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}
