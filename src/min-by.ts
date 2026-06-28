/**
 * Returns the item in `arr` that yields the smallest value from `fn`,
 * or `undefined` if `arr` is empty.
 *
 * @param arr - The array to search.
 * @param fn - A function that extracts the comparable number from each item.
 * @returns The item with the smallest `fn(item)`, or `undefined` when `arr` is empty.
 */
export function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const first = arr[0] as T;
  let bestItem: T = first;
  let bestValue = fn(first);
  for (let i = 1; i < arr.length; i++) {
    const item = arr[i] as T;
    const value = fn(item);
    if (value < bestValue) {
      bestItem = item;
      bestValue = value;
    }
  }
  return bestItem;
}
