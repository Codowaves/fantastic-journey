/**
 * Returns the elements present in both arrays, preserving the order of `a`
 * and omitting duplicates.
 *
 * @param a - The first array. Items in the result appear in this order.
 * @param b - The second array; membership is tested against its elements.
 * @returns The set intersection of `a` and `b`, with duplicates from `a` removed.
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
