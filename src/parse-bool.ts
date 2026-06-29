/**
 * Parses a loose string representation of a boolean.
 *
 * The strings `'true'`, `'1'`, and `'yes'` (case-insensitive, with optional
 * surrounding whitespace) are recognized as `true`. Anything else — including
 * `'false'`, `'0'`, `'no'`, empty strings, and non-string inputs — resolves to
 * `false`.
 *
 * @param s - The value to parse.
 * @returns `true` when `s` represents a truthy string, otherwise `false`.
 */
export function parseBool(s: unknown): boolean {
  if (typeof s !== "string") return false;
  const normalized = s.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}
