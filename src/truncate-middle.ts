/**
 * Truncates the middle of a string, replacing the removed section with an
 * ellipsis. Useful for shortening long identifiers while preserving both the
 * start and end.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the resulting string, including the ellipsis
 * @returns The truncated string, or the original if it already fits
 * @throws {RangeError} If maxLength is not an integer or is less than 1
 */
export function truncateMiddle(str: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError("maxLength must be an integer >= 1");
  }

  if (str.length <= maxLength) {
    return str;
  }

  if (maxLength === 1) {
    return "…";
  }

  const ellipsis = "…";
  const remaining = maxLength - ellipsis.length;
  const head = Math.ceil(remaining / 2);
  const tail = remaining - head;

  return str.slice(0, head) + ellipsis + str.slice(str.length - tail);
}
