/**
 * Returns a shallow copy of `obj` containing only the keys for which
 * `pred` returns a truthy value.
 *
 * The original object is not mutated. Only the object's own enumerable
 * string keys are considered (matching `Object.keys`); inherited properties
 * are ignored.
 *
 * @typeParam T - The type of the source object.
 * @param obj - The source object.
 * @param pred - Predicate invoked with each `(value, key)` pair. When it
 *   returns a truthy value, the corresponding key is included in the result.
 * @returns A new object with only the matching keys. Returns an empty object
 *   if `obj` is empty or no key satisfies `pred`; returns a shallow copy of
 *   `obj` when every key matches.
 *
 * @example
 * pickBy({ a: 1, b: 2, c: 3, d: 4 }, (v) => v % 2 === 0);
 * // { b: 2, d: 4 }
 * pickBy({ keep: 1, skip: 2, also_keep: 3 }, (_v, k) => k.startsWith("keep") || k.startsWith("also"));
 * // { keep: 1, also_keep: 3 }
 * pickBy({ a: 1, b: 2 }, () => false);
 * // {}
 * pickBy({}, () => true);
 * // {}
 */
export function pickBy<T extends object>(
  obj: T,
  pred: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (pred(value, key)) {
      result[key] = value;
    }
  }
  return result;
}
