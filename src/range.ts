/**
 * Returns an array of consecutive integers from `start` (inclusive) to
 * `end` (exclusive). If `end <= start`, an empty array is returned.
 *
 * @param start - The first integer in the range (inclusive).
 * @param end - The upper bound of the range (exclusive).
 * @returns The integers in the half-open range [`start`, `end`).
 * @throws {RangeError} If `start` or `end` is not a finite integer.
 * @example
 * range(0, 3); // [0, 1, 2]
 * range(2, 5); // [2, 3, 4]
 * range(4, 4); // []
 * range(5, 2); // []
 * range(0, 5).map((i) => i * 2); // [0, 2, 4, 6, 8]
 */
export function range(start: number, end: number): number[] {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new RangeError("range() requires integer arguments");
  }
  if (end <= start) {
    return [];
  }
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
