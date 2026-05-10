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

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;

function escapeCsvField(value: string | number): string {
  const str = String(value);
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportOrdersAsCsv(orders: Order[]): string {
  const headers = "id,customerId,total,status\n";

  if (orders.length === 0) {
    return headers;
  }

  const rows = orders.map(order => {
    return [
      escapeCsvField(order.id),
      escapeCsvField(order.customerId),
      escapeCsvField(order.total),
      escapeCsvField(order.status),
    ].join(",");
  }).join("\n");

  return headers + rows + "\n";
}
