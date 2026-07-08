/**
 * Checks whether an array contains any duplicate values.
 *
 * @param arr - An array of values (may contain any type, including `null`,
 * `undefined`, and `NaN`, which are deduplicated using SameValueZero equality).
 * @throws {TypeError} If `arr` is `null`, `undefined`, or not an array.
 * @returns `true` if any value appears more than once, `false` otherwise.
 */
export function hasDuplicates<T>(arr: readonly T[]): boolean {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (!Array.isArray(arr)) {
    throw new TypeError("arr must be an array");
  }
  const seen = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}
