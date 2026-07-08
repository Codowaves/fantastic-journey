/**
 * Returns a new object whose keys are produced by applying `fn` to each key of
 * `obj`. The corresponding values are preserved. When `fn` returns the same new
 * key for two different source keys, the later entry overwrites the earlier
 * one (iteration order follows `Object.keys(obj)`).
 *
 * Edge cases:
 * - Empty input produces an empty object.
 * - Key collisions (multiple source keys mapping to the same new key) are
 *   resolved by overwriting — the value from the last source key in
 *   `Object.keys` order wins.
 * - The input object is never mutated.
 * - `K` may differ from `string`, so the resulting object can use number,
 *   symbol, or other `PropertyKey` types as keys.
 *
 * @typeParam V - The value type of the input object.
 * @typeParam K - The type of the keys produced by `fn`.
 * @param obj - The source object. Not mutated.
 * @param fn - Function that maps each source key to a new key.
 * @returns A new object with keys remapped by `fn`.
 *
 * @example
 * Basic remapping:
 * ```ts
 * mapKeys({ a: 1, b: 2 }, (k) => k.toUpperCase());
 * // => { A: 1, B: 2 }
 * ```
 *
 * @example
 * Changing the key type to numbers:
 * ```ts
 * mapKeys({ a: 10, b: 20 }, (k) => k.charCodeAt(0));
 * // => { 97: 10, 98: 20 }
 * ```
 *
 * @example
 * Key collision — later value wins:
 * ```ts
 * mapKeys({ a: 1, b: 2, c: 3 }, () => "k");
 * // => { k: 3 }
 * ```
 */
export function mapKeys<V, K extends PropertyKey>(
  obj: Record<string, V>,
  fn: (key: string) => K,
): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const key of Object.keys(obj)) {
    result[fn(key)] = obj[key] as V;
  }
  return result;
}
