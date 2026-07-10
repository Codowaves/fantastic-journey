/**
 * Checks whether an array contains any duplicate values.
 *
 * @example
 * hasDuplicates([1, 2, 3, 2]); // true
 * hasDuplicates([1, 2, 3, 4]); // false
 * hasDuplicates([]); // false
 *
 * @returns `true` if any value appears more than once, `false` otherwise.
 */
export function hasDuplicates<T>(arr: readonly T[]): boolean {
  const seen = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}
