/**
 * Returns an array of the values of `key` for each element in `arr`.
 *
 * @typeParam T - The element type of the input array.
 * @typeParam K - The key of `T` to extract, constrained to its known keys.
 * @param arr - The array of objects to read from. Not mutated.
 * @param key - The property name to extract from each element.
 * @returns A new array containing the value of `key` for each element, in the
 *   original order. Returns an empty array if `arr` is empty.
 *
 * @example
 * pluck(
 *   [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
 *   "name",
 * );
 * // ["Alice", "Bob"]
 * pluck(
 *   [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
 *   "id",
 * );
 * // [1, 2]
 * pluck([], "id");
 * // []
 */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map((item) => item[key]);
}
