/**
 * Returns a new array sorted by the value of `key`. The sort is stable:
 * elements with equal keys keep their original relative order. The input
 * array is not mutated.
 *
 * @param arr - The array to sort.
 * @param key - The property name to sort by. Values may be `number` or `string`.
 * @returns A new array sorted ascending by `key`.
 */
export function sortByKey<T, K extends keyof T>(arr: T[], key: K): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key] as unknown;
    const bv = b[key] as unknown;
    if (typeof av === "number" && typeof bv === "number") {
      return av - bv;
    }
    return String(av).localeCompare(String(bv));
  });
}
