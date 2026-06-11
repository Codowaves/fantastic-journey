/**
 * Returns a new array with duplicates removed based on a derived key,
 * preserving the order of first occurrence.
 *
 * @param array - The array to deduplicate.
 * @param keyFn - A function that extracts the comparison key from each item.
 * @returns A new array containing the first item for each distinct key.
 */
export function uniqBy<T>(array: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
