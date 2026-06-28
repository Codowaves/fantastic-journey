/**
 * Returns the intersection of two arrays — the values that appear in both,
 * preserving the order of first occurrence in `a`.
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
