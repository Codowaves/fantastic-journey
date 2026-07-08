/**
 * Formats an amount in euro cents as a euro string with two decimal places.
 *
 * @example
 * formatEur(1234); // "€12.34"
 *
 * @param cents - Amount in euro cents.
 * @returns The formatted euro string, prefixed with "€".
 */
export { formatEur } from "../currency";

/**
 * Formats an amount in British pence as a pound string with two decimal places.
 *
 * @example
 * formatGbp(1234); // "£12.34"
 *
 * @param cents - Amount in British pence.
 * @returns The formatted pound string, prefixed with "£".
 */
export { formatGbp } from "../currency";
