// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

import { randomBytes } from "node:crypto";

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  // Use cryptographically secure random ID instead of predictable timestamp
  const randomId = randomBytes(8).toString("hex");
  return {
    id: `ord_${randomId}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
