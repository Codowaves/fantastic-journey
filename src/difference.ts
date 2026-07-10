/**
 * Returns the values in `a` that are not present in `b`. Order is preserved
 * from `a`, and the first occurrence of each value is what gets kept.
 *
 * Uses a `Set` for the lookup so membership checks stay O(1) on `b`,
 * making the overall function O(n + m).
 *
 * @param a - The array of values to filter.
 * @param b - The array of values to exclude.
 * @returns A new array containing the elements of `a` that are not in `b`.
 * @throws {TypeError} If `a` or `b` is null or undefined.
 */
export function difference<T>(a: readonly T[], b: readonly T[]): T[] {
  if (a === null || a === undefined) {
    throw new TypeError("a must be an array");
  }
  if (b === null || b === undefined) {
    throw new TypeError("b must be an array");
  }
  if (a.some((value) => typeof value === "number" && Number.isNaN(value))) {
    throw new TypeError("a must not contain NaN");
  }
  if (b.some((value) => typeof value === "number" && Number.isNaN(value))) {
    throw new TypeError("b must not contain NaN");
  }
  const excluded = new Set(b);
  return a.filter((value) => !excluded.has(value));
}
