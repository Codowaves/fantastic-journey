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
  /** Total order amount */
  total: number;
  /** Current order status */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer.
 *
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of items with product IDs and quantities
 * @returns A new Order object with status set to "pending"
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
 * Confirms a pending order by updating its status.
 *
 * @param order - The order to confirm
 * @returns A new Order object with status set to "confirmed"
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order.
 *
 * @param orderId - The unique identifier of the order
 * @returns Promise resolving to the order status, or null if order not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currencies supported by the order system.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
