/**
 * Returns an array of the values of `key` for each element in `arr`.
 *
 * @param arr - The array of objects to read from.
 * @param key - The property name to extract from each element.
 * @returns A new array containing the value of `key` for each element.
 * @throws {TypeError} If `arr` is null, undefined, or not an array.
 */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  if (
    arr === null ||
    arr === undefined ||
    (typeof arr === "number" && Number.isNaN(arr))
  ) {
    throw new TypeError("arr must be an array");
  }
  return arr.map((item) => item[key]);
}
