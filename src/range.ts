/**
 * Returns an array of integers from `start` (inclusive) to `end` (exclusive).
 *
 * @param start - The first integer in the range (inclusive).
 * @param end - The upper bound (exclusive). If `start >= end`, the result is empty.
 * @returns An array of consecutive integers from `start` to `end - 1`.
 */
export function range(start: number, end: number): number[] {
  if (start >= end) return [];
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
