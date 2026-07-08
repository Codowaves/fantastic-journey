/**
 * Returns the last element of `arr`, or `undefined` if the array is empty.
 *
 * Operates by indexed access (`arr[arr.length - 1]`) and does not mutate or
 * copy `arr`. The returned element is the live reference held by the array —
 * mutating it mutates the array's slot.
 *
 * Edge cases:
 * - An empty array (length 0) returns `undefined` without throwing.
 * - An array whose trailing slot is a sparse hole also returns `undefined`,
 *   which is indistinguishable from a slot that explicitly holds `undefined`.
 * - `null` is preserved as a value (returned as `null`, not `undefined`).
 * - `NaN` is preserved; `Number.isNaN(last([1, NaN]))` is `true`.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to read from. Not mutated.
 * @returns The final element of `arr`, or `undefined` when `arr` is empty or
 *   the trailing slot is a hole.
 *
 * @example
 * last([1, 2, 3]); // 3
 * last(["a", "b", "c"]); // "c"
 * last([]); // undefined
 * last([1, 2, undefined]); // undefined
 * last([1, 2, null]); // null
 * last([1, Number.NaN]); // NaN (verify with Number.isNaN)
 *
 * @example
 * // Object identity is preserved (no copy):
 * const obj = { id: 7 };
 * const result = last([{ id: 1 }, obj]);
 * result === obj; // true
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}
