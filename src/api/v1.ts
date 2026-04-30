// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
    createdAt: new Date(),
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: "confirmed" };
}

export function getOrderStatus(
  order: Order,
  filter?: { from?: Date; to?: Date }
): Promise<Order["status"] | null> {
  if (!order) return Promise.resolve(null);
  if (filter?.from && order.createdAt < filter.from) return Promise.resolve(null);
  if (filter?.to && order.createdAt > filter.to) return Promise.resolve(null);
  return Promise.resolve(order.status);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
