/**
 * Checks whether the given string is a palindrome, ignoring case and all
 * non-alphanumeric characters (spaces, punctuation, symbols).
 *
 * @param str - The string to test.
 * @returns `true` if `str` reads the same forwards and backwards after
 * normalization; `false` otherwise.
 */
export function isPalindrome(str: string): boolean {
  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
