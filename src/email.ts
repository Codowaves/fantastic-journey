// Second test-coverage bait — utility functions, no test file.

import type { Customer } from "./customer.js";
import type { Order } from "./api/v1.js";

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

export function sendOrderConfirmation(customer: Customer, order: Order): void {
  if (!isValidEmail(customer.email)) {
    throw new Error("Invalid customer email");
  }
  console.log(`Sending order confirmation to ${customer.email} for order ${order.id}`);
}
