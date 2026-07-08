/**
 * Returns the most frequent value in `nums`. An empty array yields `undefined`.
 * On ties, the value that appears first in `nums` is returned.
 *
 * Uses strict equality (`===`) to compare values, so `NaN === NaN` is treated
 * as `false` — a `NaN` entry will never be returned even if every element is
 * `NaN`. The first occurrence of a tied value wins, so insertion order in
 * `nums` matters when multiple values share the same maximum count.
 *
 * @param nums - The numbers to scan. Not mutated.
 * @returns The most frequent value, or `undefined` for an empty array.
 *
 * @example
 * mode([1, 2, 2, 3]);
 * // 2
 *
 * @example
 * mode([1, 1, 2, 2]);
 * // 1 (first occurrence of the tied max wins)
 *
 * @example
 * mode([]);
 * // undefined
 *
 * @example
 * mode([5]);
 * // 5 (single-element array returns that element)
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
