// O(n)
export function firstDup<T>(a: T[]): T | undefined {
  const s = new Set<T>();
  for (const x of a)
    if (s.has(x)) return x;
    else s.add(x);
  return undefined;
}
