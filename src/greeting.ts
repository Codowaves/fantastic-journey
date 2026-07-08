/**
 * Returns a friendly greeting addressed to the given name.
 *
 * @param name - The name to greet. Inserted verbatim into the output.
 * @returns A greeting string in the form `"Hello, {name}!"`.
 *
 * @example
 * greeting("World");
 * //=> "Hello, World!"
 *
 * @example
 * greeting("");
 * //=> "Hello, !"
 *
 * @example
 * greeting("  Alice  ");
 * //=> "Hello,   Alice  !"
 *
 * @example
 * greeting("名前");
 * //=> "Hello, 名前!"
 *
 * @remarks
 * Edge cases:
 * - Empty string: returns `"Hello, !"`.
 * - Surrounding/internal whitespace is preserved unchanged.
 * - Unicode (e.g. `"Élise"`, `"名前"`) is preserved as-is.
 * - Non-string values are stringified via JavaScript's default coercion
 *   (e.g. `undefined` → `"undefined"`, `null` → `"null"`).
 */
export function greeting(name: string): string {
  return `Hello, ${name}!`;
}
