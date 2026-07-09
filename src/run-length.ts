/**
 * Run-length encodes `arr` into consecutive `[value, count]` pairs. Each pair
 * represents one run of equal adjacent values and its length. Runs are emitted
 * in the order they appear in `arr`.
 *
 * Equality is determined by the regular `===` comparison, mirroring how the
 * language distinguishes values. Runs are maximal: a run extends as long as
 * each next item is strictly equal to the current value.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to encode. Not mutated.
 * @returns A new array of `[value, count]` tuples. Returns an empty array if
 *   `arr` is empty.
 * @throws {TypeError} If `arr` is `null` or `undefined`.
 */
export function runLength<T>(arr: readonly T[]): [T, number][] {
  if (arr === null || arr === undefined) {
    throw new TypeError("runLength: arr must not be null or undefined");
  }
  for (let i = 0; i < arr.length; i++) {
    if (Number.isNaN(arr[i] as number)) {
      throw new TypeError(`runLength: arr[${i}] is NaN`);
    }
  }
  return arr.reduce<[T, number][]>((acc, value) => {
    const last = acc[acc.length - 1];
    if (last !== undefined && last[0] === value) {
      last[1]++;
    } else {
      acc.push([value, 1]);
    }
    return acc;
  }, []);
}
