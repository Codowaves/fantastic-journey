/**
 * Returns the most frequent value in `nums`. An empty array yields `undefined`.
 * On ties, the value that appears first in `nums` is returned.
 *
 * @param nums - The numbers to scan.
 * @returns The most frequent value, or `undefined` for an empty array.
 *
 * @example
 * mode([1, 2, 2, 3, 3, 3, 4]); // 3
 * mode([1, 1, 2, 2, 3]); // 1 (first-seen wins on ties)
 * mode([]); // undefined
 */
export function mode(nums: number[]): number | undefined {
  const counts = new Map<number, number>();
  let best: number | undefined;
  let bestCount = 0;

  for (const n of nums) {
    const c = (counts.get(n) ?? 0) + 1;
    counts.set(n, c);
    if (c > bestCount) {
      bestCount = c;
      best = n;
    }
  }

  return best;
}
