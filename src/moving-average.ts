/**
 * Returns the simple moving average of `nums` over a sliding window of size
 * `w`. The result has one entry per window; the first window covers the first
 * `w` elements, the next covers elements 2..(w+1), and so on.
 *
 * @param nums - The input series.
 * @param w - The window size. Must be a positive integer.
 * @returns An array of length `max(0, nums.length - w + 1)` containing the
 *   moving averages. Returns `[]` when `nums.length < w`.
 */
export function movingAverage(nums: number[], w: number): number[] {
  if (nums === null || nums === undefined || Number.isNaN(nums)) {
    throw new TypeError("nums must be an array of numbers");
  }
  if (w === null || w === undefined || Number.isNaN(w)) {
    throw new TypeError("window size must be a number");
  }
  if (w <= 0) {
    throw new RangeError("window size must be a positive integer");
  }
  if (nums.length < w) {
    return [];
  }
  const out: number[] = [];
  let windowSum = 0;
  for (let i = 0; i < w; i++) {
    windowSum += nums[i]!;
  }
  out.push(windowSum / w);
  for (let i = w; i < nums.length; i++) {
    windowSum += nums[i]! - nums[i - w]!;
    out.push(windowSum / w);
  }
  return out;
}
