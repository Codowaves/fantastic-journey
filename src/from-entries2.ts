/**
 * Builds an object from an iterable of `[key, value]` pairs. Later pairs
 * overwrite earlier ones that share the same key.
 *
 * @typeParam K - The key type, constrained to a valid property key
 *   (`string`, `number`, `symbol`).
 * @typeParam V - The value type associated with each key.
 * @param pairs - An iterable of `[K, V]` tuples. Each inner element must be
 *   a 2-element array. Generators, `Set`s, `Map`s, and any custom
 *   iterable yielding tuples are all accepted.
 * @returns A new object with one entry for each pair. Returns `{}` when
 *   `pairs` yields nothing.
 *
 * @example
 * fromEntries2([["a", 1], ["b", 2]]);
 * // { a: 1, b: 2 }
 * fromEntries2(new Map([["x", 10]]));
 * // { x: 10 }
 * fromEntries2([]);
 * // {}
 *
 * @example
 * // Later pairs overwrite earlier ones with the same key:
 * fromEntries2([["a", 1], ["a", 99]]);
 * // { a: 99 }
 *
 * @example
 * // Numeric keys are coerced to strings, matching native object behavior:
 * fromEntries2<number, string>([[1, "one"], [2, "two"]]);
 * // { 1: "one", 2: "two" }
 *
 * @example
 * // `undefined` values are preserved (not stripped):
 * fromEntries2<string, number | undefined>([["a", 1], ["b", undefined]]);
 * // { a: 1, b: undefined }
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
