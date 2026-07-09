/**
 * Splits `arr` into consecutive runs where adjacent items stay in the same
 * chunk as long as `pred` returns `true` for the boundary between them. A new
 * chunk starts whenever `pred(a, b)` returns `false` for two adjacent items.
 *
 * The first item always starts the first chunk. If `arr` has fewer than two
 * items, a single chunk containing the entire input is returned.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to split. Not mutated.
 * @param pred - Predicate called on each adjacent pair `(prev, next)`. While it
 *   returns `true`, the two items are kept in the same chunk.
 * @returns A new array of chunks. Returns an empty array if `arr` is empty.
 *
 * @example
 * chunkWhile([1, 1, 2, 2, 2, 3, 1], (a, b) => a === b);
 * // [[1, 1], [2, 2, 2], [3], [1]]
 * chunkWhile([1, 2, 3, 2, 3, 4, 5, 1], (a, b) => a < b);
 * // [[1, 2, 3], [2, 3, 4, 5], [1]]
 * chunkWhile([], () => true); // []
 */
export function chunkWhile<T>(
  arr: readonly T[],
  pred: (prev: T, next: T) => boolean,
): T[][] {
  const result: T[][] = [];
  if (arr.length === 0) {
    return result;
  }
  let current: T[] = [arr[0]!];
  for (let i = 1; i < arr.length; i++) {
    const next = arr[i]!;
    if (pred(current[current.length - 1]!, next)) {
      current.push(next);
    } else {
      result.push(current);
      current = [next];
    }
  }
  result.push(current);
  return result;
}
