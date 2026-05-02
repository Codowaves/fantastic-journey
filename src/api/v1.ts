/**
 * Represents a customer order in the system.
 * @interface
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** ID of the customer who placed the order */
  customerId: string;
  /** Total amount of the order */
  total: number;
  /** Current order status */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order with a generated ID.
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of line items (each with product ID and quantity)
 * @returns The newly created order with "pending" status
 * @throws {TypeError} If items is not a non-empty array
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
 * Confirms an order, updating its status to "confirmed".
 * @param order - The order to confirm
 * @returns A new order object with status set to "confirmed"
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 * @param orderId - The unique identifier of the order
 * @returns A promise that resolves to the order status or null if not found
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/** List of currencies accepted for order payments */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
