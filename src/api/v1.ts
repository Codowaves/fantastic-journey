// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Shipped = "shipped",
  Delivered = "delivered",
}

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: OrderStatus;
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    status: OrderStatus.Pending,
  };
}

export function confirmOrder(order: Order): Order {
  return { ...order, status: OrderStatus.Confirmed };
}

export function getOrderStatus(orderId: string): Promise<OrderStatus | null> {
  return Promise.resolve(orderId ? OrderStatus.Pending : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
