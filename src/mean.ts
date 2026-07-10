/**
 * Returns the arithmetic mean of the numbers in `nums`. An empty array yields `0`.
 *
 * @param nums - The numbers to average.
 * @returns The arithmetic mean, or `0` for an empty array.
 * @throws {TypeError} If `nums` is `null` or `undefined`.
 * @throws {TypeError} If any element is `null`, `undefined`, or `NaN`.
 */
export function mean(nums: number[]): number {
  if (nums === null || nums === undefined) {
    throw new TypeError("nums must not be null or undefined");
  }
  let total = 0;
  for (const n of nums) {
    if (n === null || n === undefined) {
      throw new TypeError("array elements must not be null or undefined");
    }
    if (typeof n !== "number" || Number.isNaN(n)) {
      throw new TypeError("array elements must be finite numbers");
    }
    total += n;
  }
  if (nums.length === 0) {
    return 0;
  }
  return total / nums.length;
}
