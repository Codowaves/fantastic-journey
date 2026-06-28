/**
 * Returns a new object with the same keys as `obj`, but with each value
 * transformed by `fn`. The input object is not mutated.
 *
 * @typeParam V - The original value type.
 * @typeParam R - The transformed value type.
 * @param obj - The source object whose values will be mapped.
 * @param fn - Function that transforms each value.
 * @returns A new object with the same keys and mapped values.
 */
export function mapValues<V, R>(
  obj: Record<string, V>,
  fn: (value: V, key: string) => R,
): Record<string, R> {
  const result: Record<string, R> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key] as V;
    result[key] = fn(value, key);
  }
  return result;
}
