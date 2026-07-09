/**
 * Converts a string to kebab-case.
 *
 * Inserts a hyphen before each uppercase letter (for camelCase/PascalCase
 * boundaries), lowercases the result, collapses any run of non-alphanumeric
 * characters into a single hyphen, and strips leading and trailing hyphens.
 *
 * @param str - The input string to convert.
 * @returns The kebab-cased string (e.g. `kebabCase('HelloWorld')` returns `'hello-world'`).
 *
 * @example
 * kebabCase('HelloWorld');
 * // 'hello-world'
 * kebabCase('fooBarBaz');
 * // 'foo-bar-baz'
 * kebabCase('  Hello   World  ');
 * // 'hello-world'
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
