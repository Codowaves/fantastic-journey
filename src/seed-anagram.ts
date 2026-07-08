/**
 * Checks whether two strings are anagrams of each other (same characters with same counts, regardless of order).
 *
 * Comparison is Unicode-code-unit based, not Unicode-normalized: two strings
 * that look the same but differ in combining marks or case (e.g. `"é"` vs
 * `"é"`, or `"A"` vs `"a"`) will NOT be considered anagrams. Empty strings
 * are anagrams of each other. Inputs of different lengths can never be
 * anagrams.
 *
 * @param a - First string to compare.
 * @param b - Second string to compare.
 * @returns `true` if both strings contain the same characters with the same multiplicities, `false` otherwise.
 *
 * @example
 * isAnagram("listen", "silent"); // true
 * isAnagram("hello", "world");   // false
 * isAnagram("aabb", "abab");     // true
 * isAnagram("", "");             // true
 * isAnagram("abc", "abcd");      // false (different lengths)
 * isAnagram("A", "a");           // false (case-sensitive)
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
