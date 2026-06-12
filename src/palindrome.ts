/**
 * Checks if a string is a palindrome (reads the same forwards and backwards).
 *
 * Ignores spaces, punctuation, and case when comparing.
 *
 * @param str - The string to check
 * @returns `true` if the string is a palindrome, `false` otherwise
 */
export function isPalindrome(str: string): boolean {
  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
