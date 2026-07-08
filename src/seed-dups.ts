/**
 * Returns the first value in `a` that appears more than once, or `undefined`
 * if all elements are unique.
 *
 * @param a - The array to scan.
 * @returns The first duplicated element, or `undefined` when none exist.
 * @throws {TypeError} If `a` is null, undefined, or NaN.
 */
// O(n)
export function firstDup<T>(a: T[]): T | undefined {
  if (
    a === null ||
    a === undefined ||
    (typeof a === "number" && Number.isNaN(a))
  ) {
    throw new TypeError("a must be an array");
  }
  const s = new Set<T>();
  for (const x of a)
    if (s.has(x)) return x;
    else s.add(x);
  return undefined;
}
