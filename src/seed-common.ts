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
