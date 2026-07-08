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
 * defaultTo(null, "fallback"); // "fallback"
 * defaultTo(undefined, 99); // 99
 * defaultTo(NaN, 0); // 0
 * defaultTo(0, 42); // 0 (falsy non-nullish numbers are kept)
 * defaultTo(false, true); // false
 * defaultTo("", "fallback"); // ""
 */
export function defaultTo<T>(v: T, d: T): T {
  if (v === null || v === undefined) return d;
  if (typeof v === "number" && Number.isNaN(v)) return d;
  return v;
}
