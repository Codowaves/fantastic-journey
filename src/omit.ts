/**
 * Returns a shallow copy of `obj` without the specified `keys`.
 *
 * Keys that are not present on `obj` are silently ignored. The original
 * object is not mutated.
 *
 * @typeParam T - The type of the source object.
 * @typeParam K - The keys to omit, constrained to keys of `T`.
 * @param obj - The source object.
 * @param keys - The keys to exclude from the returned object.
 * @returns A new object without the specified keys.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const keysSet = new Set<PropertyKey>(keys);
  const result = {} as any;
  for (const key in obj) {
    if (!keysSet.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
