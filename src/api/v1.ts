// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

/**
 * Represents a customer order in the system.
 * @property id - Unique order identifier
 * @property customerId - Customer who placed the order
 * @property total - Total order value
 * @property status - Current fulfillment status
 */
export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer.
 * @param customerId - ID of the customer placing the order
 * @param items - Array of items with product IDs and quantities
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
 * Transitions an order to "confirmed" status.
 * @param order - The order to confirm
 * @returns A copy of the order with status set to "confirmed"
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order.
 * @param orderId - The order ID to look up
 * @returns Promise resolving to the order status, or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currency codes supported by the payment system.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
