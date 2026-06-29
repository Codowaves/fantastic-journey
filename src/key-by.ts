/**
 * Builds an index object from `arr`, using the result of `fn(item)` as the key
 * for each entry. When two items produce the same key, the later item
 * overwrites the earlier one.
 *
 * @param arr - The array to index. Not mutated.
 * @param fn - A function that derives a key from each item.
 * @returns A record mapping each derived key to its item. Returns an empty
 *   object if `arr` is empty.
 */
export function keyBy<T, K extends PropertyKey>(
  arr: readonly T[],
  fn: (item: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const item of arr) {
    result[fn(item)] = item;
  }
  return result;
}
