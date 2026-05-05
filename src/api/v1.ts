// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

/**
 * Represents a customer order in the system.
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** ID of the customer who placed the order */
  customerId: string;
  /** Total amount of the order */
  total: number;
  /** Current status of the order */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order with a generated ID.
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of items with product ID and quantity
 * @returns The newly created Order object
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
 * Updates an order's status to confirmed.
 * @param order - The order to confirm
 * @returns The order with updated status
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 * @param orderId - The unique identifier of the order
 * @returns The order status or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of supported currency codes for transactions.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
