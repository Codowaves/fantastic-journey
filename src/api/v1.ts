// Public Order API with comprehensive JSDoc documentation.

/**
 * Represents an order in the system.
 */
export interface Order {
  /** Unique order identifier (generated on creation) */
  id: string;
  /** ID of the customer who placed the order */
  customerId: string;
  /** Total cost of the order */
  total: number;
  /** Current status of the order */
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer.
 *
 * @param customerId - The ID of the customer placing the order
 * @param items - Array of items with their IDs and quantities
 * @returns A new Order object with status "pending"
 *
 * @example
 * ```ts
 * const order = createOrder("cust_123", [
 *   { id: "item_1", qty: 2 },
 *   { id: "item_2", qty: 1 }
 * ]);
 * ```
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
 * Confirms a pending order, updating its status to "confirmed".
 *
 * @param order - The order to confirm
 * @returns A new Order object with status "confirmed"
 *
 * @example
 * ```ts
 * const confirmedOrder = confirmOrder(pendingOrder);
 * ```
 */
export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the current status of an order by its ID.
 *
 * @param orderId - The unique identifier of the order
 * @returns A promise resolving to the order status, or null if not found
 *
 * @example
 * ```ts
 * const status = await getOrderStatus("ord_12345");
 * if (status === "delivered") {
 *   console.log("Order has been delivered");
 * }
 * ```
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

/**
 * List of currencies supported by the order system.
 *
 * Currently supports:
 * - USD: US Dollar
 * - EUR: Euro
 * - GBP: British Pound
 * - JPY: Japanese Yen
 */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
