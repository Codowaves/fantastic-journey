/**
 * Returns a new array containing the unique values present in either `a` or
 * `b`, preserving the order of first occurrence across both inputs.
 *
 * @param a - The first array.
 * @param b - The second array.
 * @returns A new array of the union of the two inputs, deduplicated.
 */
export function unionOf<T>(a: readonly T[], b: readonly T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of a) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  for (const item of b) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
