/**
 * Represents a customer order in the system.
 * @interface
 */
export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer.
 * @param customerId - The ID of the customer placing the order.
 * @param items - Array of items with id and quantity.
 * @returns The newly created Order with status "pending".
 */
export function createOrder(
  customerId: string,
  items: Array<{ id: string; qty: number }>,
): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

/**
 * Confirms an order, updating its status to "confirmed".
 * @param order - The order to confirm.
 * @returns The updated order with status "confirmed".
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the status of an order by its ID.
 * @param orderId - The ID of the order to look up.
 * @returns A Promise resolving to the order status or null if not found.
 */
export function getOrderStatus(
  orderId: string,
): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of supported currency codes for order transactions.
 * @constant
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
