/**
 * Combines two arrays into a single array of pairs, stopping at the
 * shorter input's length.
 *
 * @typeParam A - The element type of the first array.
 * @typeParam B - The element type of the second array.
 * @param a - The first array.
 * @param b - The second array.
 * @returns An array of `[a[i], b[i]]` pairs for `i` from `0` up to
 *   `min(a.length, b.length) - 1`. The original arrays are not modified.
 * @example
 * zip([1, 2, 3], ["a", "b", "c"]); // [[1, "a"], [2, "b"], [3, "c"]]
 * zip([1, 2], ["a", "b", "c"]);   // [[1, "a"], [2, "b"]]
 * zip([], [1, 2]);                // []
 */
export function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  const length = Math.min(a.length, b.length);
  const result: Array<[A, B]> = [];

  for (let i = 0; i < length; i++) {
    result.push([a[i]!, b[i]!]);
  }

  return result;
}
