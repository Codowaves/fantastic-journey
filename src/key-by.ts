/**
 * Builds an index object from `arr`, using the result of `fn(item)` as the key
 * for each entry. When two items produce the same key, the later item
 * overwrites the earlier one.
 *
 * @typeParam T - The element type of the input array.
 * @typeParam K - The derived key type, constrained to a valid property key.
 * @param arr - The array to index. Not mutated.
 * @param fn - A function that derives a key from each item.
 * @returns A record mapping each derived key to its item. Returns an empty
 *   object if `arr` is empty.
 *
 * @example
 * keyBy(
 *   [{ id: "u1", name: "Ada" }, { id: "u2", name: "Linus" }],
 *   (u) => u.id,
 * );
 * // { u1: { id: "u1", name: "Ada" }, u2: { id: "u2", name: "Linus" } }
 * keyBy([10, 20, 30], (n) => n / 10);
 * // { 1: 10, 2: 20, 3: 30 }
 * keyBy([], (n) => n);
 * // {}
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
