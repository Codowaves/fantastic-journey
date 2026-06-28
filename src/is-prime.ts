/**
 * Returns whether `n` is a prime number. A prime is an integer greater than 1
 * whose only positive divisors are 1 and itself.
 *
 * @param n - The number to test.
 * @returns `true` when `n` is prime, `false` otherwise.
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }
  if (n < 4) {
    return true;
  }
  if (n % 2 === 0) {
    return false;
  }
  const limit = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}
