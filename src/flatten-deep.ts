/**
 * Recursively flattens `arr` into a single-level array. Non-array values are
 * left untouched.
 *
 * @param arr - The (possibly nested) value to flatten.
 * @returns A new array containing every nested element in order.
 */
export function flattenDeep<T>(arr: T): T extends Array<infer U> ? U : T;
export function flattenDeep(arr: unknown): unknown {
  if (!Array.isArray(arr)) {
    return arr;
  }
  const out: unknown[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      out.push(...(flattenDeep(item) as unknown[]));
    } else {
      out.push(item);
    }
  }
  return out;
}
