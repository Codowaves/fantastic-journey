// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

/**
 * Represents an order in the system with its associated metadata and lifecycle status.
 */
export interface Order {
  /** Unique identifier for the order */
  id: string;
  /** ID of the customer who placed the order */
  customerId: string;
  /** Total value or item count for the order */
  total: number;
  /** Current lifecycle status of the order */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for the specified customer with the given items.
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of items with their IDs and quantities
 * @returns A new Order object with "pending" status
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
 * Marks an order as confirmed, transitioning it from pending to confirmed status.
 * @param order - The order to confirm
 * @returns A new Order object with "confirmed" status
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 * @param orderId - The unique identifier of the order to look up
 * @returns Promise resolving to the order status, or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currency codes supported by the order API (US Dollar, Euro, British Pound, Japanese Yen).
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
