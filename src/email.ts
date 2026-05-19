// Second test-coverage bait — utility functions, no test file.

/**
 * Validates an email address against basic format rules.
 *
 * @param input - The string to validate as an email address.
 * @returns `true` if the input is a valid email format, `false` otherwise.
 *
 * @remarks
 * Validation rules:
 * - Must be a string type
 * - Maximum length of 254 characters (per RFC 5321)
 * - Must match pattern: `local@domain.tld` where local and domain contain no whitespace or `@` symbols
 *
 * @example
 * ```ts
 * isValidEmail("user@example.com")     // true
 * isValidEmail("test@domain.org")      // true
 * isValidEmail("invalid")              // false
 * isValidEmail("user name@domain.com") // false
 * ```
 *
 * @ Limitations
 * - Does NOT support internationalized email addresses (IDN/punycode)
 * - Uses a simplified regex; for production use a validated library (e.g., `isemail`, `email-validator`)
 * - Length limit enforced but individual local/domain part lengths are not checked
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
