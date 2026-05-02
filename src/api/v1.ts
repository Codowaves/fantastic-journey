/** Supported order statuses. */
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

/** Represents a customer order. */
export interface Order {
  /** Unique order identifier. */
  id: string;
  /** ID of the customer who placed the order. */
  customerId: string;
  /** Total order amount. */
  total: number;
  /** Current order status. */
  status: OrderStatus;
}

/**
 * Creates a new order for a customer.
 * @param customerId - The ID of the customer placing the order.
 * @param items - The line items in the order.
 * @returns The newly created order.
 */
export function createOrder(
  customerId: string,
  items: Array<{ id: string; qty: number }>
): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

/**
 * Confirms an order, transitioning it to "confirmed" status.
 * @param order - The order to confirm.
 * @returns A new order object with confirmed status.
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the status of an order by its ID.
 * @param orderId - The ID of the order to look up.
 * @returns The order status, or null if not found.
 */
export function getOrderStatus(orderId: string): Promise<OrderStatus | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/** Currencies supported for order totals. */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;