export function hasDuplicates<T>(arr: readonly T[]): boolean {
  const seen = new Set<T>();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}
