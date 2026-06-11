/**
 * Converts a string into a URL-safe slug.
 *
 * Lowercases the input, trims whitespace, replaces any run of non-alphanumeric
 * characters with a single hyphen, and strips leading/trailing hyphens.
 *
 * @param str - The input string to slugify.
 * @returns A URL-safe slug (e.g. `slugify('  Hello, World!  ')` returns `'hello-world'`).
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
