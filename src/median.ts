/**
 * Returns the median of the numbers in `nums`. An empty array yields `0`.
 *
 * For an odd-length array the middle element (after sorting) is returned.
 * For an even-length array the average of the two middle elements is returned.
 *
 * @param nums - The numbers to compute the median of.
 * @returns The median value, or `0` for an empty array.
 */
export function median(nums: number[]): number {
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
