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
 */
export function runLength<T>(arr: readonly T[]): [T, number][] {
  const result: [T, number][] = [];
  if (arr.length === 0) {
    return result;
  }
  let currentValue: T = arr[0]!;
  let currentCount = 1;
  for (let i = 1; i < arr.length; i++) {
    const next = arr[i]!;
    if (next === currentValue) {
      currentCount++;
    } else {
      result.push([currentValue, currentCount]);
      currentValue = next;
      currentCount = 1;
    }
  }
  result.push([currentValue, currentCount]);
  return result;
}
