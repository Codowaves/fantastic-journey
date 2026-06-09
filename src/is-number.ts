/**
 * Type guard that returns true only for finite numbers, rejecting `NaN` and
 * `Infinity` / `-Infinity`.
 *
 * @param v - The value to test.
 * @returns True if `v` is a finite number.
 */
export function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
