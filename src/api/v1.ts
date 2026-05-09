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

export function exportOrdersAsCsv(orders: Order[]): string {
  const headers = "id,customerId,total,status\n";

  if (orders.length === 0) {
    return headers;
  }

  const rows = orders.map((order) => {
    const fields = [
      escapeCsvField(order.id),
      escapeCsvField(order.customerId),
      order.total.toString(),
      escapeCsvField(order.status),
    ];
    return fields.join(",");
  });

  return headers + rows.join("\n") + "\n";
}

function escapeCsvField(value: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
