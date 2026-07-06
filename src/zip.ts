/**
 * Pairs the elements of two arrays positionally into tuples, stopping at the
 * shorter input's length.
 *
 * @param a - The first array.
 * @param b - The second array.
 * @returns An array of `[a[i], b[i]]` tuples with length `min(a.length, b.length)`.
 */
export function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  const length = Math.min(a.length, b.length);
  const result: Array<[A, B]> = [];

  for (let i = 0; i < length; i++) {
    result.push([a[i]!, b[i]!]);
  }

  return result;
}
