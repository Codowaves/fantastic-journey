/**
 * Returns the arithmetic mean of the numbers in `nums`. An empty array yields `0`.
 *
 * @param nums - The numbers to average.
 * @returns The arithmetic mean, or `0` for an empty array.
 * @throws {TypeError} If `nums` is `null` or `undefined`, or if any element is `null`, `undefined`, or `NaN`.
 */
export function mean(nums: number[]): number {
  if (nums === null || nums === undefined) {
    throw new TypeError("nums must be an array");
  }
  let total = 0;
  for (const n of nums) {
    if (n === null || n === undefined || Number.isNaN(n)) {
      throw new TypeError("every entry of nums must be a number");
    }
    total += n;
  }
  return nums.length === 0 ? 0 : total / nums.length;
}
