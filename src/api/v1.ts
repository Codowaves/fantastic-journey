// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

/**
 * Represents a customer order in the system.
 */
export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order with pending status.
 * @param customerId - The customer's identifier.
 * @param items - Array of order items with id and quantity.
 * @returns The newly created Order.
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
 * @param order - The order to confirm.
 * @returns The order with updated status.
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the status of an order by its ID.
 * @param orderId - The order's identifier.
 * @returns A promise resolving to the order status or null if not found.
 * @throws Error if orderId is empty string (resolves to null instead).
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currencies supported for order transactions.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
