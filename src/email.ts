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
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export function sendOrderConfirmation(
  customer: { email: string; displayName: string },
  order: { id: string; total: number }
): EmailMessage {
  return {
    to: customer.email,
    subject: `Order Confirmation - ${order.id}`,
    body: `Hello ${customer.displayName},\n\nYour order ${order.id} for $${order.total} has been confirmed.\n\nThank you!`,
  };
}
