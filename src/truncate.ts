/**
 * Truncates a string to a maximum length, appending an ellipsis when it cuts.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length including the ellipsis
 * @returns The truncated string or the original if it fits
 * @throws {RangeError} If maxLength is not an integer or is less than 1
 */
export function truncate(str: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength must be an integer >= 1");
  }

  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 1) + "…";
}
