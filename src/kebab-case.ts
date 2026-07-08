/**
 * Converts a string to kebab-case.
 *
 * Inserts a hyphen before each uppercase letter (for camelCase/PascalCase
 * boundaries), lowercases the result, collapses any run of non-alphanumeric
 * characters into a single hyphen, and strips leading and trailing hyphens.
 *
 * Throws `TypeError` if `str` is `null`, `undefined`, or not a string.
 *
 * @param str - The input string to convert.
 * @returns The kebab-cased string (e.g. `kebabCase('HelloWorld')` returns `'hello-world'`).
 */
export function kebabCase(str: string): string {
  if (str === null || str === undefined) {
    throw new TypeError("Input cannot be null or undefined");
  }
  if (typeof str !== "string") {
    throw new TypeError(`Input must be a string, got ${typeof str}`);
  }

  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
