/**
 * Returns true when `v` has no meaningful content.
 *
 * Treats `null`, `undefined`, empty strings, empty arrays, and objects with
 * no own enumerable keys as empty.
 *
 * @param v - The value to check.
 * @returns `true` when `v` is empty, otherwise `false`.
 */
export function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}
