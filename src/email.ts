// Second test-coverage bait — utility functions, no test file.

/**
 * Validates whether a string matches basic email format.
 * @param input - The email string to validate
 * @returns True if the input matches a basic email pattern, false otherwise
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * @param input - The email string to normalize
 * @returns The normalized email address
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks the local part of an email address for privacy, keeping the first 2 characters visible.
 * @param input - The email string to mask
 * @returns The masked email (e.g., "jo****@example.com")
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
