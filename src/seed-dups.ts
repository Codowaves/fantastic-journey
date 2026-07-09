/**
 * Returns the first value in `a` that appears more than once, or `undefined`
 * if all elements are unique.
 *
 * @param a - The array to scan.
 * @returns The first duplicated element, or `undefined` when none exist.
 *
 * @example
 * firstDup([1, 2, 3, 2]); // 2
 * firstDup([1, 2, 3]);    // undefined
 */
// O(n)
export function firstDup<T>(a: T[]): T | undefined {
  const s = new Set<T>();
  for (const x of a)
    if (s.has(x)) return x;
    else s.add(x);
  return undefined;
}
