/**
 * Returns the number of words in `str`, separated by whitespace.
 *
 * Throws when `str` is `null`, `undefined`, or not a string.
 *
 * @param str - The string to count words in.
 * @returns The number of words. An empty or whitespace-only string yields `0`.
 */
export function countWords(str: string): number {
  if (str === null || str === undefined) {
    throw new TypeError(
      `countWords: str must be a string, got ${str === null ? "null" : "undefined"}`,
    );
  }
  if (typeof str !== "string") {
    throw new TypeError(`countWords: str must be a string, got ${typeof str}`);
  }

  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}
