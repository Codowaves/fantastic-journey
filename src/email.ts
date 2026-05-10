// Second test-coverage bait — utility functions, no test file.

/**
 * Validates whether a string is a well-formed email address.
 * Note: Uses simplified validation; production code should use a tested library.
 * @param input - The string to validate
 * @returns True if the input is a valid email format, false otherwise
 */
export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

/**
 * Normalizes an email address to lowercase and removes leading/trailing whitespace.
 * @param input - The email address to normalize
 * @returns The normalized email address
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks the local part of an email address for privacy, keeping the first 2 characters visible.
 * @param input - The email address to mask
 * @returns The masked email (e.g., "ab****@example.com")
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
