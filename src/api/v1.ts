import { AuthorizationError, authService } from "../auth";

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

  if (
    request.method === "GET" &&
    url.pathname === "/settings/security/sessions"
  ) {
    try {
      const workspaceId = request.headers.get("x-workspace-id") ?? "default";
      const role =
        request.headers.get("x-workspace-role") === "owner"
          ? "owner"
          : "member";

      return new Response(
        authService.renderSessionsAdminPage(workspaceId, role),
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      );
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      throw error;
    }
  }

  if (
    request.method === "DELETE" &&
    url.pathname.startsWith("/settings/security/sessions/")
  ) {
    try {
      const workspaceId = request.headers.get("x-workspace-id") ?? "default";
      const role =
        request.headers.get("x-workspace-role") === "owner"
          ? "owner"
          : "member";
      const ownerUserId =
        request.headers.get("x-user-id") ?? "unknown-owner";
      const sessionId = url.pathname.split("/").at(-1) ?? "";

      authService.revokeSession({
        workspaceId,
        sessionId,
        requesterRole: role,
        ownerUserId,
        ip: request.headers.get("x-forwarded-for") ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
      });

      return Response.json({ ok: true }, { status: 200 });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      throw error;
    }
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
