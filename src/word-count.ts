/**
 * Counts the whitespace-separated tokens in a string, trimming leading/trailing whitespace.
 * Returns 0 for an empty or whitespace-only string.
 *
 * @param s - The input string to count words in.
 * @returns The number of whitespace-separated tokens, or 0 if `s` is empty or all whitespace.
 */
export function wordCount(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
