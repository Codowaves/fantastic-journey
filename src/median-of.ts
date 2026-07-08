/**
 * Returns the median of the numbers in `nums`. An empty array yields `0`.
 *
 * For an odd-length array the middle element (after sorting) is returned.
 * For an even-length array the average of the two middle elements is returned.
 *
 * The input array is not mutated — the function sorts a shallow copy internally.
 * Inputs that are not already in ascending order do not need to be pre-sorted.
 *
 * Edge cases:
 * - Empty array → returns `0` (not `NaN`).
 * - Single-element array → returns that element unchanged.
 * - Even-length array → returns the arithmetic mean of the two center values,
 *   which may be a non-integer (e.g. `[1, 2, 3, 4]` → `2.5`).
 * - Negative numbers and values straddling zero are handled normally.
 * - Duplicate values are handled correctly; the median is determined by the
 *   middle position(s) after sorting, regardless of how many times a value
 *   repeats (e.g. `[1, 1, 100, 101]` → `50.5`).
 *
 * @param nums - The numbers to compute the median of.
 * @returns The median value, or `0` for an empty array.
 *
 * @example
 * ```ts
 * medianOf([1, 2, 3, 4, 5]); // 3
 * medianOf([1, 2, 3, 4]);    // 2.5
 * medianOf([]);              // 0
 * medianOf([-2, -1, 1, 2]);  // 0
 * ```
 */
export function medianOf(nums: number[]): number {
  if (nums.length === 0) {
    return 0;
  }

  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid]!;
  }

  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}
