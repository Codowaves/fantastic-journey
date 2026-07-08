/**
 * Returns the intersection of two arrays — the values that appear in both,
 * preserving the order of first occurrence in `a`.
 *
 * Equality is determined by `Set` membership, which uses the SameValueZero
 * algorithm (so `NaN === NaN` and `+0 === -0`). Object references are
 * compared by identity, not by structural equality.
 *
 * @param a - The first array. Its order drives the output order. Not mutated.
 * @param b - The second array; values not present here are excluded. Not
 *   mutated.
 * @returns A new array containing the unique values found in both `a` and
 *   `b`, in the order they first appear in `a`. Returns `[]` when there is
 *   no overlap or when either input is empty.
 *
 * @example
 * intersection([1, 2, 3, 4], [2, 3, 4, 5]);
 * // [2, 3, 4]
 * intersection([4, 3, 2, 1], [1, 2, 3, 4]);
 * // [4, 3, 2, 1] — order follows `a`
 * intersection([1, 2, 2, 3, 3, 3], [2, 3]);
 * // [2, 3] — duplicates from `a` are collapsed
 *
 * @example
 * // Edge cases
 * intersection([], [1, 2, 3]);
 * // []
 * intersection([1, 2, 3], []);
 * // []
 * intersection([1, 2, 3], [4, 5, 6]);
 * // [] — no overlap
 * intersection([NaN, 1, 2], [NaN, 2, 3]);
 * // [NaN, 2] — NaN matches NaN under SameValueZero
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const set = new Set(b);
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of a) {
    if (set.has(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
