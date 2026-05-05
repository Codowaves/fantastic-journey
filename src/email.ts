// Second test-coverage bait — utility functions, no test file.

/**
 * Validates whether an input string is a properly formatted email address.
 * @param input - The string to validate
 * @returns True if the input is a valid email format
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * @param input - The email address to normalize
 * @returns The normalized email address
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks an email address for privacy, showing only the first two characters of the local part.
 * @param input - The email address to mask
 * @returns The masked email address (e.g., "jo****@example.com")
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
