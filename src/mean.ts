/**
 * Returns the arithmetic mean of `numbers`. An empty array yields `0`.
 *
 * @param numbers - The numbers to average.
 * @returns The arithmetic mean, or `0` for an empty array.
 */
export function mean(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total / numbers.length;
}
