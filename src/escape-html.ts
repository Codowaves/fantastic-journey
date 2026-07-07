const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes the HTML-significant characters in `str` so it can be safely
 * embedded in HTML text or attribute values.
 *
 * Replaces `&`, `<`, `>`, `"`, and `'` with their corresponding HTML
 * entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).
 *
 * @param str - The string to escape. Not mutated.
 * @returns A new string with HTML-significant characters replaced by entities.
 * @throws {TypeError} If `str` is null, undefined, or NaN.
 */
export function escapeHtml(str: string): string {
  if (
    str === null ||
    str === undefined ||
    (typeof str === "number" && Number.isNaN(str))
  ) {
    throw new TypeError("str must be a string");
  }
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] as string);
}
