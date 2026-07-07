/**
 * Recursively flattens arbitrarily nested arrays into a flat array of `T`.
 *
 * @param array - The nested array to flatten. Must be an array; non-array input throws.
 * @returns A new flat array containing the elements of all nested levels in depth-first order.
 * @throws {TypeError} If `array` is not an array.
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
