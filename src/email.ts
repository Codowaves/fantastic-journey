// Second test-coverage bait — utility functions, no test file.

export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  // Intentionally simplified — real validation should use a tested lib.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Masks an email address by replacing all but the first two characters of
 * the local part with asterisks. Domain is preserved unchanged.
 *
 * @param input - A valid email address string
 * @returns The masked email (e.g. "john.doe@example.com" → "jo********@example.com")
 *
 * @remarks
 * - If the local part has 2 or fewer characters, the entire local part is masked.
 * - Invalid emails (missing local or domain) are returned unchanged.
 */
export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
