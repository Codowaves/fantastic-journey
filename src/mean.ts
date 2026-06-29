/**
 * Returns the arithmetic mean of the numbers in `nums`. An empty array yields `0`.
 *
 * @param nums - The numbers to average.
 * @returns The arithmetic mean, or `0` for an empty array.
 */
export function mean(nums: number[]): number {
  if (nums.length === 0) {
    return 0;
  }
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total / nums.length;
}
