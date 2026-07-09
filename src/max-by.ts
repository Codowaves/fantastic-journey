/**
 * Returns the element of `arr` for which `fn` produces the largest value.
 *
 * If multiple elements tie for the largest value, the first such element is
 * returned. For an empty array, `undefined` is returned.
 *
 * @typeParam T - The element type of the input array.
 * @param arr - The array to inspect.
 * @param fn - A function that derives a comparable key from each element.
 * @returns The element with the largest key, or `undefined` when `arr` is empty.
 *
 * @example
 * maxBy([3, 1, 4, 1, 5, 9, 2, 6], (n) => n);
 * // 9
 * maxBy(
 *   [{ name: "Ada", age: 36 }, { name: "Linus", age: 55 }],
 *   (p) => p.age,
 * );
 * // { name: "Linus", age: 55 }
 * maxBy([], (n) => n);
 * // undefined
 */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  let bestItem = arr[0];
  let bestKey = fn(bestItem as T);
  for (let i = 1; i < arr.length; i++) {
    const item = arr[i] as T;
    const key = fn(item);
    if (key > bestKey) {
      bestItem = item;
      bestKey = key;
    }
  }
  return bestItem;
}
