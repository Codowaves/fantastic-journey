/**
 * Returns the number of words in `str`, separated by whitespace.
 * Returns 0 for non-string, null, undefined, or NaN input.
 *
 * @param str - The string to count words in.
 * @returns The number of words. An empty or whitespace-only string yields `0`.
 */
export function countWords(str: string): number {
  if (typeof str !== "string" || Number.isNaN(str as unknown as number)) {
    return 0;
  }
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}
