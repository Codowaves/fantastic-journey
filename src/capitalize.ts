/**
 * Capitalizes the first character of a string, leaving the rest unchanged.
 * Returns the input verbatim if it is empty.
 *
 * @param str - The string to capitalize.
 * @returns The string with its first character upper-cased.
 */
export function capitalize(str: string): string {
  if (
    str === null ||
    str === undefined ||
    (typeof str === "number" && Number.isNaN(str))
  ) {
    throw new TypeError("str must be a string");
  }
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
