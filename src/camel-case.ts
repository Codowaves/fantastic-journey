/**
 * Converts a string into camelCase.
 *
 * Trims whitespace, lowercases the input, splits on any run of non-alphanumeric
 * characters, then lowercases every word after the first and capitalizes the
 * rest. The first character is forced to lowercase, so leading whitespace or
 * punctuation does not leave a capital first letter.
 *
 * Throws `TypeError` if `text` is `null`, `undefined`, or not a string.
 *
 * @param text - The input string to convert.
 * @returns The camelCased string.
 *
 * @example
 * camelCase("hello world");
 * // "helloWorld"
 * camelCase("HelloWorld");
 * // "helloWorld"
 * camelCase("foo__bar--baz qux");
 * // "fooBarBazQux"
 * camelCase("item 42 price");
 * // "item42Price"
 *
 * @example
 * // Edge cases: empty or non-alphanumeric inputs return "".
 * camelCase("");
 * // ""
 * camelCase("!!! ??? ---");
 * // ""
 *
 * @example
 * // Throws TypeError for null, undefined, or non-string input.
 * camelCase(null);
 * // TypeError: Input cannot be null or undefined
 * camelCase(42);
 * // TypeError: Input must be a string, got number
 */
export function camelCase(text: string): string {
  if (text === null || text === undefined) {
    throw new TypeError("Input cannot be null or undefined");
  }
  if (typeof text !== "string") {
    throw new TypeError(`Input must be a string, got ${typeof text}`);
  }

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
