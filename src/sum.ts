/**
 * Returns the total of all numbers in `nums`. An empty array yields `0`.
 *
 * @param nums - The numbers to sum.
 * @returns The arithmetic total, or `0` for an empty array.
 *
 * @example
 * sum([1, 2, 3, 4]);
 * // 10
 * sum([7]);
 * // 7
 * sum([]);
 * // 0
 */
export function sum(nums: number[]): number {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}
