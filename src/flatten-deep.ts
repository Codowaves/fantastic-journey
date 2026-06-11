/**
 * Recursively flattens a nested array to a single level.
 *
 * @param array - The array to flatten.
 * @returns A new array with all nested arrays flattened.
 * @throws {TypeError} If the input is not an array.
 */
export function flattenDeep<T>(array: unknown[]): T[] {
  if (!Array.isArray(array)) {
    throw new TypeError("Input must be an array");
  }

  const result: T[] = [];

  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flattenDeep<T>(item));
    } else {
      result.push(item as T);
    }
  }

  return result;
}
