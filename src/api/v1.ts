// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

/**
 * Creates a new order for a customer with the given items.
 *
 * @param customerId - The unique identifier of the customer placing the order.
 * @param items - An array of items, each with an `id` and `qty` (quantity).
 * @returns The newly created `Order` object with a generated ID, "pending" status,
 *   and `total` equal to the number of items in the array (not the sum of quantities).
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

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(
  orderId: string,
): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
