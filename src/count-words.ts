/**
 * Returns the number of words in `str`, separated by whitespace.
 *
 * @param str - The string to count words in.
 * @returns The number of words. An empty or whitespace-only string yields `0`.
 */
export function countWords(str: string): number {
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}
