/**
 * Capitalizes the first character of a string.
 * @param str - The string to capitalize
 * @returns The string with its first character uppercased, or an empty string if the input is empty
 */
export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
