/**
 * Computes the greatest common divisor of two non-negative integers using the
 * Euclidean algorithm.
 *
 * @param a - A non-negative integer.
 * @param b - A non-negative integer.
 * @returns The greatest non-negative integer that divides both `a` and `b`.
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}
