// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

/**
 * Retrieves the status of an order by its ID.
 *
 * @param orderId - The unique identifier of the order to look up.
 *                   Pass a falsy value (empty string, null, etc.) to return null.
 * @returns A promise that resolves to the order status (`"pending"`, `"confirmed"`,
 *          `"shipped"`, or `"delivered"`) if `orderId` is truthy, or `null` if
 *          `orderId` is falsy or the order is not found.
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
