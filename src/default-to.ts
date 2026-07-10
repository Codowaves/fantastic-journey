/**
 * Returns `v` unless it is `null`, `undefined`, or `NaN`, in which case
 * returns `d`.
 *
 * @param v - The value to test.
 * @param d - The fallback to return when `v` is nullish or NaN.
 * @returns `v` when defined and not NaN, otherwise `d`.
 *
 * @example
 * defaultTo(1, 10); // 1
 * defaultTo(null, 10); // 10
 * defaultTo(undefined, 10); // 10
 * defaultTo(NaN, 10); // 10
 */
export function defaultTo<T>(v: T, d: T): T {
  if (v === null || v === undefined) return d;
  if (typeof v === "number" && Number.isNaN(v)) return d;
  return v;
}
