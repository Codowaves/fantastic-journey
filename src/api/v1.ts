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

export function getOrderStatus(orderId: string): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export function exportOrdersAsCsv(orders: Order[]): string {
  const headers = "id,customerId,total,status";
  const rows = orders.map((order) => {
    const escape = (val: string | number) =>
      typeof val === "string" && /[",\n\r]/.test(val)
        ? `"${val.replace(/"/g, '""')}"`
        : String(val);
    return [escape(order.id), escape(order.customerId), escape(order.total), escape(order.status)].join(",");
  });
  return [headers, ...rows].join("\n") + "\n";
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
