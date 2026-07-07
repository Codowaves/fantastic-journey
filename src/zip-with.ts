/**
 * Combines two arrays elementwise using `fn`, stopping at the shorter
 * input's length.
 *
 * @param a - The first input array.
 * @param b - The second input array.
 * @param fn - The combiner invoked with the elements at each index.
 * @returns A new array of `fn`'s results at each shared index.
 */
export function zipWith<A, B, R>(a: A[], b: B[], fn: (a: A, b: B) => R): R[] {
  const length = Math.min(a.length, b.length);
  const result: R[] = [];

  for (let i = 0; i < length; i++) {
    result.push(fn(a[i]!, b[i]!));
  }

  return result;
}
