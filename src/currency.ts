/**
 * Formats an amount in cents as a euro string with two decimal places.
 *
 * @param cents - Amount in euro cents.
 * @returns The formatted euro string, prefixed with "€" (e.g. 1234 → "€12.34").
 * @throws {TypeError} If `cents` is null, undefined, or NaN.
 *
 * @example
 * formatEur(1234);   // "€12.34"
 * formatEur(0);      // "€0.00"
 * formatEur(105);    // "€1.05"
 */
export function formatEur(cents: number): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) {
    throw new TypeError("cents must be a finite number");
  }
  return "€" + (cents / 100).toFixed(2);
}

/**
 * Formats an amount in pence as a pound string with two decimal places.
 *
 * @param cents - Amount in British pence.
 * @returns The formatted pound string, prefixed with "£" (e.g. 1234 → "£12.34").
 * @throws {TypeError} If `cents` is null, undefined, or NaN.
 *
 * @example
 * formatGbp(1234);   // "£12.34"
 * formatGbp(0);      // "£0.00"
 * formatGbp(105);    // "£1.05"
 */
export function formatGbp(cents: number): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) {
    throw new TypeError("cents must be a finite number");
  }
  return "£" + (cents / 100).toFixed(2);
}
