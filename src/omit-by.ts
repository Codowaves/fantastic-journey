/**
 * Returns a shallow copy of `obj` with the keys for which `pred` returns a
 * truthy value omitted.
 *
 * The original object is not mutated.
 *
 * @typeParam T - The type of the source object.
 * @param obj - The source object.
 * @param pred - Predicate invoked with each `(value, key)` pair. When it
 *   returns a truthy value, the corresponding key is dropped from the result.
 * @returns A new object with the matching keys removed.
 */
export function omitBy<T extends object>(
  obj: T,
  pred: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (!pred(value, key)) {
      result[key] = value;
    }
  }
  return result;
}
