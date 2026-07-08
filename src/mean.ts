/**
 * Returns the arithmetic mean of the numbers in `nums`. An empty array yields `0`.
 *
 * @param nums - The numbers to average.
 * @returns The arithmetic mean, or `0` for an empty array.
 * @throws {TypeError} If `nums` is null, undefined, or contains a non-finite number.
 */
export function mean(nums: number[]): number {
  if (nums === null || nums === undefined) {
    throw new TypeError("nums must be an array of numbers");
  }
  if (nums.length === 0) {
    return 0;
  }
  let total = 0;
  for (const n of nums) {
    if (n === null || n === undefined || Number.isNaN(n)) {
      throw new TypeError("nums must contain only finite numbers");
    }
    total += n;
  }
  return total / nums.length;
}
