/**
 * Returns the elements present in both arrays, preserving the order of `a`
 * and omitting duplicates.
 *
 * @param a - The first array. Items in the result appear in this order.
 * @param b - The second array; membership is tested against its elements.
 * @returns The set intersection of `a` and `b`, with duplicates from `a` removed.
 *
 * @example
 * commonItems([1, 2, 3], [2, 3, 4]); // [2, 3]
 *
 * @example
 * commonItems([1, 1, 2], [1, 2]); // [1, 2] — duplicates from `a` are removed
 *
 * @example
 * commonItems([], [1, 2]); // [] — empty `a` yields empty result
 *
 * Edge cases:
 * - If `a` is empty, the result is always `[]` regardless of `b`.
 * - Duplicates within `a` are collapsed (each element appears at most once).
 * - `b` may contain duplicates; they do not affect the output beyond membership.
 * - Membership uses SameValueZero semantics (matches `Set.has`), so `NaN === NaN`
 *   and `+0 === -0` for comparison purposes.
 * - Order follows `a`, not `b`.
 */
// O(n + m) using Set for O(1) membership checks.
export function commonItems<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of a) {
    if (setB.has(x) && !seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}
