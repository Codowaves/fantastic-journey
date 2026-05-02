// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
}

function isValidCustomerId(customerId: string): boolean {
  return typeof customerId === "string" && customerId.length > 0 && customerId.startsWith("cust_");
}

export function createOrder(customerId: string, items: Array<{ id: string; qty: number }>): Order {
  if (!isValidCustomerId(customerId)) {
    throw new Error("Invalid customerId: must be a non-empty string starting with 'cust_'");
  }
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

export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
