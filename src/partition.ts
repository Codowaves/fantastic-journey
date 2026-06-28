/**
 * Splits the items in `items` into two arrays based on whether `pred`
 * returns true or false for each element. The relative order of items is
 * preserved within each bucket, in the order they appeared in the input.
 *
 * @typeParam T - The element type of the input array.
 * @param items - The array of items to partition. Not mutated.
 * @param pred - Predicate applied to each item.
 * @returns A tuple `[pass, fail]` where `pass` contains items for which
 *   `pred` returned true and `fail` contains the rest. Both arrays are
 *   empty when the input is empty.
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
