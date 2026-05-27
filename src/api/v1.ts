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

export function getOrderStatus(
  orderId: string,
): Promise<Order["status"] | null> {
  return Promise.resolve(orderId ? "pending" : null);
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;

// In-memory projects store — in production this would be a database query.
// Guard against undefined rows by defaulting to empty array.
const projects: Array<{ id: string; name: string; created_at: string }> = [];

function getProjects(): Array<{
  id: string;
  name: string;
  created_at: string;
}> {
  return projects ?? [];
}

export function handleRequest(request: Request): Response {
  const url = new URL(request.url);

  if (
    request.method === "GET" &&
    (url.pathname === "/healthz" || url.pathname === "/health")
  ) {
    return Response.json(
      { status: "ok", uptimeSeconds: Math.floor(process.uptime()) },
      { status: 200 },
    );
  }

  if (request.method === "GET" && url.pathname === "/api/projects") {
    return Response.json({ items: getProjects() }, { status: 200 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
