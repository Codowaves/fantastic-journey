const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /^[a-z][a-z0-9+.-]*:\/\/\S+$/i;

/**
 * Returns `true` when `value` looks like an email address of the form
 * `local@domain.tld`.
 *
 * The check is intentionally lightweight: it rejects whitespace and the
 * `@` boundary requires at least one `.` after the `@`. It is not a full
 * RFC 5322 validator — it is suitable for fast input gating, not for
 * deciding whether mail can actually be delivered.
 *
 * @param value - The candidate string.
 * @returns `true` when the value matches the simple email shape.
 */
export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/**
 * Returns `true` when `value` is a syntactically valid URL string.
 *
 * Accepts any scheme that starts with an ASCII letter followed by
 * scheme characters, followed by `://` and at least one non-whitespace
 * character. Both `http://example.com` and `https://example.com/path?q=1`
 * pass; bare paths like `"/foo"` do not.
 *
 * @param value - The candidate string.
 * @returns `true` when the value parses as an absolute URL.
 */
export function isUrl(value: string): boolean {
  return URL_RE.test(value);
}

/**
 * Returns `true` when `value` matches a UUID (versions 1–5, case-insensitive).
 *
 * Accepts the canonical hyphenated 8-4-4-4-12 hex form. Braced forms
 * (`{...}`) and the `urn:uuid:` prefix are not accepted — strip them
 * before calling if your input may include them.
 *
 * @param value - The candidate string.
 * @returns `true` when the value is a well-formed UUID string.
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
