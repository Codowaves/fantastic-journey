/**
 * Returns a new array with consecutive duplicates collapsed to a single
 * occurrence. Only runs of strictly equal adjacent items are merged; non
 * adjacent duplicates are preserved. The input is not mutated.
 *
 * Items are compared with strict equality (`===`). This means `NaN !== NaN`,
 * so consecutive `NaN` values will not be collapsed.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to deduplicate. Not mutated.
 * @returns A new array with consecutive duplicates removed.
 *
 * @example
 * dedupeAdjacent([1, 1, 2, 3, 3, 3, 2]); // [1, 2, 3, 2]
 * dedupeAdjacent(['a', 'b', 'b', 'a']); // ['a', 'b', 'a']
 * dedupeAdjacent([]); // []
 * dedupeAdjacent([NaN, NaN]); // [NaN, NaN]
 */
export function dedupeAdjacent<T>(arr: readonly T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]!;
    if (i === 0 || current !== result[result.length - 1]) {
      result.push(current);
    }
  }
  return result;
}
