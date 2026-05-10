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
  orderId: string,
  filter?: { from?: Date; to?: Date }
): Promise<Order["status"] | null> {
  if (!orderId) {
    return Promise.resolve(null);
  }

  // Mock order creation date (in real impl, this would be fetched from DB)
  const orderDate = new Date();

  // Apply date range filter if provided
  if (filter) {
    if (filter.from && orderDate < filter.from) {
      return Promise.resolve(null);
    }
    if (filter.to && orderDate > filter.to) {
      return Promise.resolve(null);
    }
  }

  return Promise.resolve("pending");
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
