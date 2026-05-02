// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

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

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export function getOrderStatus(
  orderId: string,
  filter?: DateRangeFilter,
): Promise<Order["status"] | null> {
  const status = orderId ? "pending" : null;
  if (status === null) return Promise.resolve(null);
  const now = new Date();
  if (filter?.from && now < filter.from) return Promise.resolve(null);
  if (filter?.to && now > filter.to) return Promise.resolve(null);
  return Promise.resolve(status);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
