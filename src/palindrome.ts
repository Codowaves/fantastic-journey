/**
 * Checks whether the given string reads the same forwards and backwards,
 * ignoring case and any non-alphanumeric characters (spaces, punctuation, etc.).
 *
 * @param str - The string to evaluate.
 * @returns `true` if `str` is a palindrome after normalization; `false` otherwise.
 *
 * @example
 * isPalindrome("racecar");                          // true
 * isPalindrome("A man, a plan, a canal: Panama");   // true
 * isPalindrome("hello");                            // false
 *
 * @remarks
 * Edge cases:
 * - Empty string returns `true` (an empty string reads the same forwards and backwards).
 * - Single-character strings always return `true`.
 * - Non-alphanumeric characters (spaces, punctuation, Unicode symbols) are stripped before comparison.
 * - Comparison is case-insensitive after lowercasing the normalized string.
 * - Numeric-only strings are treated the same as alphabetic strings.
 */
export function isPalindrome(str: string): boolean {
  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
