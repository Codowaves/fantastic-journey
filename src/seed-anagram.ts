/**
 * Checks whether two strings are anagrams of each other (same characters with same counts, regardless of order).
 *
 * @param a - First string to compare.
 * @param b - Second string to compare.
 * @returns `true` if both strings contain the same characters with the same multiplicities, `false` otherwise.
 */
export function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const c of a) counts.set(c, (counts.get(c) ?? 0) + 1);
  for (const c of b) {
    const count = counts.get(c) ?? 0;
    if (count === 0) return false;
    counts.set(c, count - 1);
  }
  return true;
}
