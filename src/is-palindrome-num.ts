/**
 * Returns true if the integer `n` reads the same forwards and backwards.
 *
 * Negative numbers are not considered palindromes (the leading `-` sign
 * prevents the digit sequence from matching its reverse).
 *
 * @param n - The integer to check.
 * @returns `true` if `n` is a palindrome, `false` otherwise.
 *
 * @example
 * isPalindromeNum(121);
 * // true
 * isPalindromeNum(12321);
 * // true
 * isPalindromeNum(10);
 * // false
 *
 * @example
 * // Edge cases:
 * isPalindromeNum(0);            // true — single digit, trivially a palindrome
 * isPalindromeNum(5);            // true
 * isPalindromeNum(-121);         // false — negative numbers are never palindromes
 * isPalindromeNum(10);           // false — trailing zero breaks digit-reversal symmetry
 * isPalindromeNum(null);         // false — null/undefined coerced input
 * isPalindromeNum(undefined);    // false
 * isPalindromeNum(Number.NaN);   // false — NaN is not a valid integer
 */
export function isPalindromeNum(n: number): boolean {
  if (n == null || Number.isNaN(n)) {
    return false;
  }
  if (n < 0) {
    return false;
  }
  const digits = String(n);
  const reversed = digits.split("").reverse().join("");
  return digits === reversed;
}
