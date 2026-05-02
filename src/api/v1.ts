import type { Customer } from "../customer.js";

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export function createOrder(customer: Customer, items: Array<{ id: string; qty: number }>): Order {
  if (!customer.id) throw new Error("customerId is required");
  return {
    id: `ord_${Date.now()}`,
    customerId: customer.id,
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
