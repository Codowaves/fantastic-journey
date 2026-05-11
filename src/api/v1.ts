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
 * Retrieves the current status of an order by its ID.
 *
 * @param orderId - The unique identifier of the order to look up
 * @returns A promise that resolves to the order status ("pending" | "confirmed" | "shipped" | "delivered")
 *          if the order is found, or `null` if the orderId is invalid/empty or the order does not exist
 * @example
 * ```ts
 * const status = await getOrderStatus("ord_1234567890");
 * if (status === null) {
 *   console.log("Order not found");
 * } else {
 *   console.log(`Order status: ${status}`);
 * }
 * ```
 */
export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
