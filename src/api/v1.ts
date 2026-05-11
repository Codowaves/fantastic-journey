// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

/**
 * Returns a new Order object with status set to "confirmed".
 *
 * This is a pure function that does not mutate the original order,
 * trigger database saves, send email notifications, or perform any
 * other side effects. It simply creates a shallow copy with an
 * updated status field.
 *
 * @param order - The order to confirm
 * @returns A new Order object with status: "confirmed"
 *
 * @example
 * const pending = createOrder("cust_123", [{ id: "item_1", qty: 2 }]);
 * const confirmed = confirmOrder(pending);
 * // pending.status === "pending" (unchanged)
 * // confirmed.status === "confirmed"
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
