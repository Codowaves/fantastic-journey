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

export function maskEmail(input: string): string {
  const [local, domain] = input.split("@");
  if (!local || !domain) return input;
  // Mask entire local part if length < 3 to avoid leaking short addresses
  if (local.length < 3) {
    return `${"*".repeat(local.length)}@${domain}`;
  }
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(local.length - 2)}@${domain}`;
}
