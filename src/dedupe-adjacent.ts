/**
 * Returns a new array with consecutive duplicates collapsed to a single
 * occurrence. Only runs of strictly equal adjacent items are merged; non
 * adjacent duplicates are preserved. The input is not mutated.
 *
 * Items are compared with strict equality (`===`). This means `NaN !== NaN`,
 * so consecutive `NaN` values will not be collapsed.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to deduplicate. Not mutated.
 * @returns A new array with consecutive duplicates removed.
 *
 * @example
 * dedupeAdjacent([1, 1, 2, 2, 2, 3, 1]); // [1, 2, 3, 1]
 *
 * @example
 * dedupeAdjacent([]); // []
 *
 * @example
 * dedupeAdjacent(["a", "a", "b"]); // ["a", "b"]
 *
 * Edge cases:
 * - Empty input returns an empty array.
 * - A single-element input returns a one-element array.
 * - `null` and `undefined` are distinct under `===`, so runs of each are
 *   collapsed independently but not against each other.
 * - `0` and `-0` are equal under `===` and therefore collapse together.
 * - `NaN` is never equal to itself, so consecutive `NaN` values are NOT
 *   collapsed — they are all preserved.
 * - Object references are compared by identity, not by structural equality:
 *   two distinct objects with identical fields are NOT collapsed even when
 *   adjacent.
 * - Distinct object references are preserved even when structurally identical.
 */
export function dedupeAdjacent<T>(arr: readonly T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]!;
    if (i === 0 || current !== result[result.length - 1]) {
      result.push(current);
    }
  }
  return result;
}
