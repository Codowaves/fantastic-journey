/**
 * Splits the items in `items` into two arrays based on whether `pred`
 * returns true or false for each element. The relative order of items is
 * preserved within each bucket, in the order they appeared in the input.
 *
 * The input array is not mutated, and the result is always a 2-tuple
 * `[pass, fail]` of arrays — never `null` or `undefined`. If `pred` is
 * always true, `fail` is empty; if always false, `pass` is empty.
 *
 * @typeParam T - The element type of the input array.
 * @param items - The array of items to partition. Not mutated.
 * @param pred - Predicate applied to each item. Called once per element
 *   in input order.
 * @returns A tuple `[pass, fail]` where `pass` contains items for which
 *   `pred` returned true and `fail` contains the rest. Both arrays are
 *   empty when the input is empty.
 *
 * @example
 * // Partition numbers into evens and odds, preserving order
 * const [evens, odds] = partition([1, 2, 3, 4], (n) => n % 2 === 0);
 * // evens => [2, 4]
 * // odds  => [1, 3]
 *
 * @example
 * // Empty input yields two empty arrays
 * const [pass, fail] = partition<string>([], () => true);
 * // pass => []
 * // fail => []
 */
export function partition<T>(
  items: readonly T[],
  pred: (item: T) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of items) {
    if (pred(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}
