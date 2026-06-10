/**
 * Groups the items in `items` by the key returned from `keyFn`. The relative
 * order of items is preserved within each group, in the order they appeared
 * in the input.
 *
 * @typeParam T - The element type of the input array.
 * @typeParam K - The derived key type, constrained to a valid property key.
 * @param items - The array of items to group. Not mutated.
 * @param keyFn - Function that derives the grouping key for each item.
 * @returns A record mapping each derived key to the array of items that
 *   produced it. Returns an empty object for an empty input.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    const bucket = result[key];
    if (bucket) {
      bucket.push(item);
    } else {
      result[key] = [item];
    }
  }
  return result;
}
