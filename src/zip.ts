/**
 * Combines two arrays into a single array of pairs, stopping at the
 * shorter input's length.
 *
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c']); // [[1, 'a'], [2, 'b'], [3, 'c']]
 * zip([1, 2], ['a', 'b', 'c']); // [[1, 'a'], [2, 'b']]
 * zip([1, 2, 3], []); // []
 */
export function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  const length = Math.min(a.length, b.length);
  const result: Array<[A, B]> = [];

  for (let i = 0; i < length; i++) {
    result.push([a[i]!, b[i]!]);
  }

  return result;
}
