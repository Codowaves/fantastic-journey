/**
 * Converts `str` to snake_case. Inserts an underscore between a lowercase
 * letter and an uppercase letter, between two uppercase letters followed by
 * a lowercase letter, between a letter and a digit, and between a digit and
 * a letter. Non-alphanumeric characters are treated as word separators.
 *
 * @param str - The string to convert.
 * @returns The snake_cased form of `str`.
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-zA-Z])(\d)/g, "$1_$2")
    .replace(/(\d)([a-zA-Z])/g, "$1_$2")
    .replace(/[\s\-_]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}
