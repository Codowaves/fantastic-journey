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
 *
 * @example
 * countBy([{ type: 'a' }, { type: 'b' }, { type: 'a' }], (x) => x.type);
 * // { a: 2, b: 1 }
 * countBy([1, 2, 3, 4, 5, 6], (n) => n % 2);
 * // { 0: 3, 1: 3 }
 * countBy([], (x) => x);
 * // {}
 *
 * @remarks
 * Edge cases:
 * - Items that all map to the same key collapse into a single entry whose
 *   count equals `items.length`; no duplicates are produced.
 * - A single-element input always yields a record with one entry and a
 *   count of `1`.
 * - `keyFn` is invoked exactly once per item, in input order; it must not
 *   mutate `items` (this function does not copy the array — passing a
 *   mutable reference is fine, but `keyFn` should treat it as read-only).
 * - Keys are restricted to `PropertyKey` (string, number, or symbol); the
 *   returned record only contains entries for keys that were actually
 *   produced by `keyFn`.
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
