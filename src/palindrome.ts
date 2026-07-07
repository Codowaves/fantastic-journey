/**
 * Checks whether the given string reads the same forwards and backwards,
 * ignoring case and any non-alphanumeric characters (spaces, punctuation, etc.).
 *
 * @param str - The string to evaluate.
 * @returns `true` if `str` is a palindrome after normalization; `false` otherwise.
 */
export function isPalindrome(str: string): boolean {
  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
