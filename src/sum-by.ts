/**
 * Returns the total of `fn(item)` for each item in `arr`. An empty array
 * yields `0`.
 *
 * @param arr - The items to map then sum.
 * @param fn  - The function applied to each item before adding.
 * @returns The arithmetic total, or `0` for an empty array.
 */
export function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  let total = 0;
  for (const item of arr) {
    total += fn(item);
  }
  return total;
}
