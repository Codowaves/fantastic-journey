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
 * @example
 * invert({ a: 1, b: 2, c: 3 }); // { 1: "a", 2: "b", 3: "c" }
 * invert({ a: "x", b: "y" }); // { x: "a", y: "b" }
 * invert({}); // {}
 * @throws {TypeError} If `obj` is null, undefined, or not an object.
 */
export function invert<T extends Record<PropertyKey, PropertyKey>>(
  obj: T,
): Record<string, keyof T> {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    throw new TypeError("obj must be an object");
  }
  const result: Record<string, keyof T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    const value = obj[key];
    if (typeof value === "string") {
      result[value] = key;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[String(value)] = key;
    }
  }
  return result;
}
