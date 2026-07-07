/**
 * Returns the factorial of `n` (i.e. `n! = n × (n-1) × … × 1`).
 *
 * By convention, `0! === 1`.
 *
 * @param n - A non-negative integer.
 * @returns The factorial of `n`.
 * @throws RangeError when `n` is negative.
 * @example
 * factorial(0); // => 1
 * @example
 * factorial(5); // => 120
 * @example
 * factorial(-1); // throws RangeError
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n)) {
    throw new RangeError(`factorial requires an integer, got ${n}`);
  }
  if (n < 0) {
    throw new RangeError(
      `factorial is not defined for negative numbers, got ${n}`,
    );
  }
  if (n < 2) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
