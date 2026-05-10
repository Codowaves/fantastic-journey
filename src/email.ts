// Second test-coverage bait — utility functions, no test file.

/**
 * Validates whether a string matches basic email format.
 * Uses a simplified regex pattern — not suitable for production validation.
 * @param input - The string to validate as an email address
 * @returns true if the input matches the basic email pattern, false otherwise
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
 * Masks the local part of an email address for privacy display.
 * Shows only the first 2 characters of the local part, replacing the rest with asterisks.
 * @param input - The email address to mask
 * @returns The masked email (e.g., "ab****@example.com")
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
