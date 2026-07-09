/**
 * Returns an array of consecutive integers from `start` (inclusive) to
 * `end` (exclusive). If `end <= start`, an empty array is returned.
 *
 * @param start - The first integer in the range (inclusive).
 * @param end - The upper bound of the range (exclusive).
 * @returns The integers in the half-open range [`start`, `end`).
 * @throws {RangeError} If `start` or `end` is not a finite integer.
 */
export function range(start: number, end: number): number[] {
  if (start === null || start === undefined || Number.isNaN(start)) {
    throw new RangeError("range() requires integer arguments");
  }
  if (end === null || end === undefined || Number.isNaN(end)) {
    throw new RangeError("range() requires integer arguments");
  }
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
