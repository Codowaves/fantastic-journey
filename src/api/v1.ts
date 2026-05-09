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

const orders = new Map<string, Order>();

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  const order: Order = {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: "pending",
    createdAt: new Date(),
  };
  orders.set(order.id, order);
  return order;
}

export function confirmOrder(order: Order): Order {
  const confirmed = { ...order, status: "confirmed" as const };
  orders.set(confirmed.id, confirmed);
  return confirmed;
}

export function getOrderStatus(
  orderId: string,
  filter?: { from?: Date; to?: Date }
): Promise<Order["status"] | null> {
  const order = orders.get(orderId);
  if (!order) {
    return Promise.resolve(orderId ? "pending" : null);
  }

  if (filter) {
    const orderTime = order.createdAt.getTime();
    if (filter.from && orderTime < filter.from.getTime()) {
      return Promise.resolve(null);
    }
    if (filter.to && orderTime > filter.to.getTime()) {
      return Promise.resolve(null);
    }
  }

  return Promise.resolve(order.status);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
