// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer with the given items.
 *
 * @param customerId - The unique identifier of the customer placing the order.
 * @param items - Array of items being ordered, each with an id and quantity.
 * @returns The newly created order with a generated ID and "pending" status.
 */
export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

/**
 * Confirms an order by updating its status to "confirmed".
 *
 * @param order - The order to confirm.
 * @returns A new order object with status set to "confirmed".
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the status of an order by its ID.
 *
 * @param orderId - The unique identifier of the order to look up.
 * @returns A promise that resolves to the order's status, or null if not found.
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/** Supported currency codes for order transactions. */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;