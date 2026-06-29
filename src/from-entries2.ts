/**
 * Builds an object from an iterable of `[key, value]` pairs. Later pairs
 * overwrite earlier ones that share the same key.
 *
 * @param pairs - An iterable of `[K, V]` tuples. Each inner element must be
 *   a 2-element array.
 * @returns A new object with one entry for each pair. Returns `{}` when
 *   `pairs` yields nothing.
 */
export function fromEntries2<K extends PropertyKey, V>(
  pairs: Iterable<readonly [K, V]>,
): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const pair of pairs) {
    result[pair[0]] = pair[1];
  }
  return result;
}
