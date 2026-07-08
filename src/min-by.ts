/**
 * Returns the item in `arr` that yields the smallest value from `fn`,
 * or `undefined` if `arr` is empty.
 *
 * Throws when `arr` is `null`/`undefined`/`NaN`, or when `fn` returns
 * `NaN` (or `null`/`undefined`) for any item in `arr`.
 *
 * @param arr - The array to search.
 * @param fn - A function that extracts the comparable number from each item.
 * @returns The item with the smallest `fn(item)`, or `undefined` when `arr` is empty.
 */
export function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }
  if (arr.length === 0) {
    return undefined;
  }
  const first = arr[0] as T;
  const firstValue = fn(first);
  if (
    firstValue === null ||
    firstValue === undefined ||
    Number.isNaN(firstValue)
  ) {
    throw new TypeError("fn must return a finite number");
  }
  let bestItem: T = first;
  let bestValue = firstValue;
  for (let i = 1; i < arr.length; i++) {
    const item = arr[i] as T;
    const value = fn(item);
    if (value === null || value === undefined || Number.isNaN(value)) {
      throw new TypeError("fn must return a finite number");
    }
    if (value < bestValue) {
      bestItem = item;
      bestValue = value;
    }
  }
  return bestItem;
}
