/**
 * Returns `str` with its first character converted to upper case; the
 * remainder of the string is left untouched. Returns the input unchanged
 * when empty.
 */
export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
