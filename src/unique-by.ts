/**
 * Returns a new array with duplicates removed based on a derived key,
 * preserving the order of first occurrence.
 *
 * @param arr - The array to deduplicate.
 * @param keyFn - A function that extracts the comparison key from each item.
 * @returns A new array containing the first item for each distinct key.
 */
export function uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (typeof keyFn !== "function") {
    throw new TypeError("keyFn must be a function");
  }
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (
      key === null ||
      key === undefined ||
      (typeof key === "number" && Number.isNaN(key))
    ) {
      throw new TypeError("keyFn returned null, undefined, or NaN");
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
