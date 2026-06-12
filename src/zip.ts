/**
 * Combines two arrays into an array of tuples, pairing elements by index.
 * @param a - First array to zip
 * @param b - Second array to zip
 * @returns Array of tuples where each tuple contains one element from each input array at the same index, up to the length of the shorter array
 */
export function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  const length = Math.min(a.length, b.length);
  const result: Array<[A, B]> = [];

  for (let i = 0; i < length; i++) {
    result.push([a[i]!, b[i]!]);
  }

  return result;
}
