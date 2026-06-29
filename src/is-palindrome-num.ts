/**
 * Returns true if the integer `n` reads the same forwards and backwards.
 *
 * Negative numbers are not considered palindromes (the leading `-` sign
 * prevents the digit sequence from matching its reverse).
 *
 * @param n - The integer to check.
 * @returns `true` if `n` is a palindrome, `false` otherwise.
 */
export function isPalindromeNum(n: number): boolean {
  if (n < 0) {
    return false;
  }
  const digits = String(n);
  const reversed = digits.split("").reverse().join("");
  return digits === reversed;
}
