/**
 * Returns the intersection of two arrays — the values that appear in both,
 * preserving the order of first occurrence in `a`.
 *
 * @param a - The first array. Its order drives the output order.
 * @param b - The second array; values not present here are excluded.
 * @returns A new array containing the unique values found in both `a` and
 *   `b`, in the order they first appear in `a`. Returns `[]` when there is
 *   no overlap or when either input is empty.
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
