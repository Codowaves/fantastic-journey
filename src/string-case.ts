/**
 * Splits a string into its constituent words, normalizing across camelCase,
 * PascalCase, snake_case, kebab-case, space-separated, and mixed-separator
 * inputs. Returns lowercase words; non-alphanumeric runs collapse to a
 * single boundary.
 */
function splitWords(input: string): string[] {
  const withBoundaries = input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2");
  return withBoundaries
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 0);
}

/** Converts `str` to camelCase. */
export function toCamel(str: string): string {
  if (str === null || str === undefined || Number.isNaN(str)) {
    throw new TypeError("str must be a string");
  }
  const words = splitWords(str);
  if (words.length === 0) {
    return "";
  }
  const [first, ...rest] = words;
  const tail = rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return [first, ...tail].join("");
}

/** Converts `str` to snake_case. */
export function toSnake(str: string): string {
  if (str === null || str === undefined || Number.isNaN(str)) {
    throw new TypeError("str must be a string");
  }
  return splitWords(str).join("_");
}

/** Converts `str` to kebab-case. */
export function toKebab(str: string): string {
  if (str === null || str === undefined || Number.isNaN(str)) {
    throw new TypeError("str must be a string");
  }
  return splitWords(str).join("-");
}
