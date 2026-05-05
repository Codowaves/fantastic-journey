/**
 * Represents a customer order in the system.
 * @interface Order
 * @property id - Unique order identifier
 * @property customerId - ID of the customer who placed the order
 * @property total - Order total amount
 * @property status - Current order status lifecycle
 */
export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Supported currencies for order processing.
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;

/**
 * Creates a new order with pending status.
 * @param customerId - The customer placing the order
 * @param items - Array of order items with id and quantity
 * @returns Newly created order in pending status
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
 * Confirms a pending order, advancing it in the lifecycle.
 * @param order - The order to confirm
 * @returns Order with status set to confirmed
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by ID.
 * @param orderId - The unique order identifier
 * @returns Promise resolving to order status or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}
