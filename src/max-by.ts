/**
 * Returns the element of `arr` for which `fn` produces the largest value.
 *
 * If multiple elements tie for the largest value, the first such element is
 * returned. For an empty array, `undefined` is returned.
 *
 * @param arr - The array to inspect.
 * @param fn - A function that derives a comparable key from each element.
 * @returns The element with the largest key, or `undefined` when `arr` is empty.
 */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr === null || arr === undefined) {
    throw new TypeError("arr must be an array");
  }
  if (typeof fn !== "function") {
    throw new TypeError("fn must be a function");
  }
  if (arr.length === 0) {
    return undefined;
  }

  let bestItem: T = arr[0] as T;
  let bestKey = fn(bestItem);
  if (bestKey === null || bestKey === undefined || Number.isNaN(bestKey)) {
    throw new TypeError("fn must return a finite number");
  }
  for (let i = 1; i < arr.length; i++) {
    const item = arr[i] as T;
    const key = fn(item);
    if (key === null || key === undefined || Number.isNaN(key)) {
      throw new TypeError("fn must return a finite number");
    }
    if (key > bestKey) {
      bestItem = item;
      bestKey = key;
    }
  }
  return bestItem;
}
