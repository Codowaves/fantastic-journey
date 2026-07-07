/**
 * Flattens `arr` one level deep. Nested elements are pulled up into the
 * resulting array in order; non-array elements are kept as-is.
 *
 * @param arr - The array to flatten one level.
 * @returns A new array with one level of nesting removed.
 * @throws {TypeError} If `arr` is null, undefined, or NaN.
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  if (
    arr === null ||
    arr === undefined ||
    (typeof arr === "number" && Number.isNaN(arr))
  ) {
    throw new TypeError("arr must be an array");
  }
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      for (const inner of item) {
        result.push(inner);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
