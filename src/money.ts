// Seed: shipped without tests.
/**
 * Formats a USD amount stored as integer cents into a human-readable string with a leading `$`.
 *
 * @param cents - The amount in cents (e.g. `1999` for $19.99).
 * @returns The formatted amount as `$<decimal>` with two digits after the decimal point.
 */
export function formatUsd(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}
/**
 * Adds a tax rate to a cent-denominated amount and rounds to the nearest cent.
 *
 * @param cents - The pre-tax amount in cents.
 * @param rate - The tax rate as a decimal fraction (e.g. `0.1` for 10%).
 * @returns The post-tax total in cents, rounded to the nearest integer.
 */
export function addTax(cents: number, rate: number): number {
  return Math.round(cents * (1 + rate));
}
