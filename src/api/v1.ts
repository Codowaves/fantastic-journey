// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

/**
 * Represents an order in the system.
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** ID of the customer who placed the order */
  customerId: string;
  /** Total value of the order */
  total: number;
  /** Current status of the order */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer with the specified items.
 *
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of items with their IDs and quantities
 * @returns A new Order object with status "pending"
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
 * @param order - The order to confirm
 * @returns A new Order object with status "confirmed"
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 *
 * @param orderId - The ID of the order to look up
 * @returns A Promise that resolves to the order status, or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currency codes supported by the order API.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
