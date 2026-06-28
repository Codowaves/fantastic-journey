/**
 * Sums the numeric values produced by `fn` for each item in `array`. An empty
 * array yields `0`.
 *
 * @typeParam T - The element type of the input array.
 * @param array - The array of items to project and sum. Not mutated.
 * @param fn - Function that extracts a numeric value from each item.
 * @returns The arithmetic total of the projected values, or `0` for an empty
 *   array.
 */
export function sumBy<T>(array: readonly T[], fn: (item: T) => number): number {
  let total = 0;
  for (const item of array) {
    total += fn(item);
  }
  return total;
}
