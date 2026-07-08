/**
 * Checks whether the given string reads the same forwards and backwards,
 * ignoring case and any non-alphanumeric characters (spaces, punctuation, etc.).
 *
 * Throws `TypeError` if `str` is `null`, `undefined`, or not a string.
 *
 * @param str - The string to evaluate.
 * @returns `true` if `str` is a palindrome after normalization; `false` otherwise.
 */
export function isPalindrome(str: string): boolean {
  if (str === null || str === undefined) {
    throw new TypeError("Input cannot be null or undefined");
  }
  if (typeof str !== "string") {
    throw new TypeError(`Input must be a string, got ${typeof str}`);
  }

  // Normalize: remove spaces and punctuation, keep alphanumeric, convert to lowercase
  const normalized = str.replace(/[^a-z0-9]/gi, "").toLowerCase();

  // Compare with reverse
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}
