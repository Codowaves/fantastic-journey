/**
 * Splits `array` into two arrays based on `predicate`. Items for which the
 * predicate returns `true` come first (the "pass" array), followed by items
 * for which it returns `false` (the "fail" array). The relative order of
 * items is preserved within each output array, in the order they appeared
 * in the input.
 *
 * @typeParam T - The element type of the input array.
 * @param array - The array to partition. Not mutated.
 * @param predicate - Function evaluated on each item to decide which output
 *   array it lands in.
 * @returns A tuple `[pass, fail]` of disjoint arrays that together contain
 *   every item from the input.
 */
export function partition<T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}
