/**
 * Converts a string into camelCase.
 *
 * Trims whitespace, lowercases the input, splits on any run of non-alphanumeric
 * characters, then lowercases every word after the first and capitalizes the
 * rest. The first character is forced to lowercase, so leading whitespace or
 * punctuation does not leave a capital first letter.
 *
 * @param text - The input string to convert.
 * @returns The camelCased string (e.g. `camelCase('hello world')` returns `'helloWorld'`).
 */
export function camelCase(text: string): string {
  const parts = text
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "";
  }

  const [first, ...rest] = parts;
  const tail = rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  return [first, ...tail].join("");
}
