// Second test-coverage bait — utility functions, no test file.

/**
 * Checks whether a string is a valid email address format.
 * @param input - The string to validate.
 * @returns true if the input appears to be a valid email, false otherwise.
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * @param input - The email address to normalize.
 * @returns The normalized email address string.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks an email address, revealing only the first two characters of the local part.
 * @param input - A valid email address string.
 * @returns The masked email (e.g., "jo***@example.com"), or the original input if malformed.
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
