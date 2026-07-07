/**
 * Converts a space-separated string to title case by uppercasing the first
 * character of each word.
 *
 * @param str - The input string to convert.
 * @returns The string with the first character of each space-separated word uppercased.
 */
export function titleCase(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str
    .split(" ")
    .map((word) => {
      if (word.length === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
