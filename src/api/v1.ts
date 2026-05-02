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
 * Creates a new order for a customer with the given line items.
 * @param customerId - The ID of the customer placing the order.
 * @param items - Array of line items, each with an ID and quantity.
 * @returns The newly created Order with status "pending".
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
 * Confirms a pending order, transitioning its status to "confirmed".
 * @param order - The order to confirm.
 * @returns A new Order object with status set to "confirmed".
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 * @param orderId - The unique identifier of the order.
 * @returns A Promise resolving to the order's status, or null if not found.
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/** Supported currency codes for order totals. */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
