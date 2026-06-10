/**
 * Returns a shallow copy of `obj` containing only the specified `keys`.
 *
 * Keys that are not present on `obj` are silently ignored. The original
 * object is not mutated.
 *
 * @typeParam T - The type of the source object.
 * @typeParam K - The keys to pick, constrained to keys of `T`.
 * @param obj - The source object.
 * @param keys - The keys to include in the returned object.
 * @returns A new object with only the specified keys.
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
