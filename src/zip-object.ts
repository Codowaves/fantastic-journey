/**
 * Builds an object from parallel `keys` and `vals` arrays. The first element
 * of `keys` is paired with the first element of `vals`, the second with the
 * second, and so on. The returned object is built from scratch; inputs are
 * not mutated.
 *
 * If `keys` contains duplicate values, later entries overwrite earlier ones.
 *
 * @param keys - The property names for the resulting object. Must have the
 *   same length as `vals`.
 * @param vals - The property values for the resulting object. Must have the
 *   same length as `keys`.
 * @returns A new object whose own enumerable properties are the (key, val)
 *   pairs at each index.
 * @throws {RangeError} If `keys` and `vals` have different lengths.
 */
export function zipObject<K extends PropertyKey, V>(
  keys: readonly K[],
  vals: readonly V[],
): Record<K, V> {
  if (keys.length !== vals.length) {
    throw new RangeError(
      `zipObject: keys and vals must have the same length, got ${keys.length} and ${vals.length}`,
    );
  }
  const result = {} as Record<K, V>;
  for (const [i, key] of keys.entries()) {
    result[key] = vals[i] as V;
  }
  return result;
}
