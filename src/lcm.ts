/**
 * Returns the least common multiple of two non-negative integers.
 *
 * @param a - A non-negative integer.
 * @param b - A non-negative integer.
 * @returns The smallest non-negative integer divisible by both `a` and `b`.
 */
export function lcm(a: number, b: number): number {
  if (a === null || a === undefined || Number.isNaN(a)) {
    throw new TypeError("a must be a number");
  }
  if (b === null || b === undefined || Number.isNaN(b)) {
    throw new TypeError("b must be a number");
  }
  if (a === 0 || b === 0) {
    return 0;
  }
  let x = a;
  let y = b;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  const gcd = x;
  return (a / gcd) * b;
}
