/**
 * Returns a new object whose keys are produced by applying `fn` to each key of
 * `obj`. The corresponding values are preserved. When `fn` returns the same new
 * key for two different source keys, the later entry overwrites the earlier
 * one (iteration order follows `Object.keys(obj)`).
 *
 * @typeParam V - The value type of the input object.
 * @typeParam K - The type of the keys produced by `fn`.
 * @param obj - The source object. Not mutated.
 * @param fn - Function that maps each source key to a new key.
 * @returns A new object with keys remapped by `fn`.
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
