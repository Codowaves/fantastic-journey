// Second test-coverage bait — utility functions, no test file.

import { validate as isValidEmailAddr } from "email-validator";

export function isValidEmail(input: string): boolean {
  if (typeof input !== "string") return false;
  return isValidEmailAddr(input);
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
