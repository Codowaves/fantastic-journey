/**
 * Returns an array of the values of `key` for each element in `arr`.
 *
 * @param arr - The array of objects to read from.
 * @param key - The property name to extract from each element.
 * @returns A new array containing the value of `key` for each element.
 *
 * @example
 * const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
 * pluck(users, "id");   // [1, 2]
 * pluck(users, "name"); // ["Alice", "Bob"]
 */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map((item) => item[key]);
}
