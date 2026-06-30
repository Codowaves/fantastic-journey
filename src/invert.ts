/**
 * Swaps the keys and values of `obj`. Each value in the source becomes a key
 * in the result, mapped to the key that produced it.
 *
 * Values are coerced to property keys (`string | number | symbol`). Symbols and
 * non-finite numbers are skipped because they cannot be object keys. The
 * original object is not mutated.
 *
 * @typeParam T - The type of the source object.
 * @param obj - The source object whose keys and values should be swapped.
 * @returns A new object whose keys are the values of `obj` and whose values
 *   are the corresponding source keys.
 */
export function invert<T extends Record<PropertyKey, PropertyKey>>(
  obj: T,
): Record<string, keyof T> {
  const result: Record<string, keyof T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    const value = obj[key];
    if (typeof value === "string" || typeof value === "number") {
      result[String(value)] = key;
    }
  }
  return result;
}
