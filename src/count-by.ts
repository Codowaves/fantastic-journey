/**
 * Counts the items in `items`, grouping them by the key returned from
 * `keyFn`. The count for each key reflects how many items in `items`
 * produced that key, preserving the order in which keys are first
 * encountered (since JS records preserve insertion order for string keys,
 * and numeric keys are stored in ascending numeric order).
 *
 * @typeParam T - The element type of the input array.
 * @typeParam K - The derived key type, constrained to a valid property key.
 * @param items - The array of items to count. Not mutated.
 * @param keyFn - Function that derives the grouping key for each item.
 * @returns A record mapping each derived key to the number of items that
 *   produced it. Returns an empty object for an empty input.
 */
export function countBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, number> {
  const result = {} as Record<K, number>;
  for (const item of items) {
    const key = keyFn(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}
