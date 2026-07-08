/**
 * Recursively flattens arbitrarily nested arrays into a flat array of `T`.
 *
 * Elements are emitted in depth-first order. The recursion only re-checks
 * `Array.isArray` on items that are themselves arrays, so non-array values
 * (including primitives, `null`, `undefined`, and objects) pass through
 * unchanged via the fallback branch — they do not trigger the top-level
 * `TypeError`, which is reserved for the input itself.
 *
 * @typeParam T - The element type of the resulting flat array.
 * @param array - The nested array to flatten. The top-level argument must be
 *   an array; non-array input throws a `TypeError`.
 * @returns A new flat array containing the elements of all nested levels in
 *   depth-first order. Returns a new (empty) array when `array` is empty.
 *
 * @example
 * flattenDeep([1, [2, [3, [4]]]]);
 * // [1, 2, 3, 4]
 * flattenDeep([]);
 * // []
 * flattenDeep([1, ["a", [true, [null, [undefined]]]]]);
 * // [1, "a", true, null, undefined]
 *
 * @throws {TypeError} If the top-level `array` argument is not an array
 *   (e.g. `null`, `undefined`, a string, or a plain object).
 */
export function flattenDeep<T>(array: unknown[]): T[] {
  if (!Array.isArray(array)) {
    throw new TypeError("flattenDeep expects an array");
  }
  const out: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      out.push(...flattenDeep<T>(item));
    } else {
      out.push(item as T);
    }
  }
  return out;
}
