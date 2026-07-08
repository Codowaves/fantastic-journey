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
 * @throws {TypeError} If `obj` is null, undefined, NaN, or not an object, or
 *   if `pred` is null, undefined, NaN, or not a function.
 */
export function omitBy<T extends object>(
  obj: T,
  pred: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  if (
    obj === null ||
    obj === undefined ||
    (typeof obj === "number" && Number.isNaN(obj))
  ) {
    throw new TypeError("obj must be an object");
  }
  if (typeof obj !== "object" && typeof obj !== "function") {
    throw new TypeError(`obj must be an object, got ${typeof obj}`);
  }
  if (
    pred === null ||
    pred === undefined ||
    (typeof pred === "number" && Number.isNaN(pred))
  ) {
    throw new TypeError("pred must be a function");
  }
  if (typeof pred !== "function") {
    throw new TypeError(`pred must be a function, got ${typeof pred}`);
  }
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (!pred(value, key)) {
      result[key] = value;
    }
  }
  return result;
}
