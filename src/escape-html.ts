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
 * entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`). Characters without
 * HTML significance (letters, digits, most punctuation, whitespace) are
 * returned unchanged.
 *
 * Note: `&` is replaced before any other entity, so passing a string that
 * already contains entities (e.g. `"&lt;"`) will double-encode the leading
 * ampersand (`"&amp;lt;"`). Callers that need to preserve existing entities
 * should not pre-escape their input.
 *
 * Note: this function does not validate or sanitize URL schemes, `<script>`
 * tags, or event-handler attributes — it only escapes character data. For
 * untrusted HTML, use a dedicated sanitizer in addition to this function.
 *
 * @param str - The string to escape. Not mutated.
 * @returns A new string with HTML-significant characters replaced by entities.
 *   Returns `""` unchanged when `str` is empty.
 * @throws {TypeError} If `str` is `null`, `undefined`, or `NaN`.
 *
 * @example
 * escapeHtml("<div class=\"x\">it's &amp; ready</div>");
 * // "&lt;div class=&quot;x&quot;&gt;it&#39;s &amp;amp; ready&lt;/div&gt;"
 * escapeHtml("hello world 123"); // "hello world 123"
 * escapeHtml("");                // ""
 * escapeHtml("&lt;");            // "&amp;lt;"
 *
 * @example
 * escapeHtml(null);        // throws TypeError
 * escapeHtml(undefined);   // throws TypeError
 * escapeHtml(NaN);         // throws TypeError
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
