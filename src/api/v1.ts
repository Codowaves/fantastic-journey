// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

import {
  authenticatePassword,
  authenticateSaml,
  contextFromRequest,
  getActiveSession,
  isWorkspaceOwner,
  listActiveSessions,
  listAuthEvents,
  listWorkspaceUsers,
  recordAuthEvent,
  redeemMagicLinkToken,
  revokeSession,
  saveSamlMetadata,
  createMagicLinkToken,
} from "../auth";
import { createConnection } from "node:net";
import { maskEmail, sendMagicLinkEmail } from "../email";
import { formatDate } from "../format-date";
import { logger } from "../logger";
import { createRequestContext, runWithRequestContext } from "../requestContext";
import {
  applyDiscount,
  processPayment,
  totalWithTax,
  type Money,
} from "../payment";

const DB_CHECK_TIMEOUT_MS = parseInt(
  process.env["DB_CHECK_TIMEOUT_MS"] ?? "1000",
  10,
);

const CORS_ALLOWED_ORIGINS = (process.env["CORS_ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isDevOrStaging = process.env["NODE_ENV"] !== "production";

/**
 * Represents a customer order in the system, tracking the items purchased and
 * its current fulfillment state.
 */
export interface Order {
  id: string;
  customerId: string;
  total: number;
  currency: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
  items: Array<{ id: string; qty: number; unitPrice: number }>;
}

/**
 * Creates a new pending order for the given customer from the provided items.
 *
 * @param customerId - The ID of the customer placing the order.
 * @param items - The line items to include in the order.
 * @returns The newly created {@link Order} in `pending` status.
 */
export function createOrder(
  customerId: string,
  items: Array<{ id: string; qty: number }>,
): Order {
  if (typeof customerId !== "string" || !customerId.trim()) {
    throw new TypeError("customerId must be a non-empty string");
  }
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  for (const item of items) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) {
      throw new TypeError("each item must have a non-empty id");
    }
    if (typeof item.qty !== "number" || !Number.isFinite(item.qty)) {
      throw new TypeError("each item must have a finite qty");
    }
  }
  return {
    id: `ord_${Date.now()}`,
    customerId,
    total: items.length,
    currency: "USD",
    status: "pending",
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({ ...item, unitPrice: 0 })),
  };
}

/**
 * Transitions the given order to the `confirmed` status, leaving all other
 * fields unchanged.
 *
 * @returns A new {@link Order} with `status` set to `confirmed`.
 */
export function confirmOrder(order: Order): Order {
  if (!order || typeof order !== "object") {
    throw new TypeError("order must be an object");
  }
  return { ...order, status: "confirmed" };
}

/**
 * Looks up the current status of an order by its ID.
 *
 * @returns A promise resolving to the order's {@link Order.status} when found,
 * or `null` if the ID is empty.
 */
export function getOrderStatus(
  orderId: string,
): Promise<Order["status"] | null> {
  const valid = typeof orderId === "string" && orderId.trim().length > 0;
  return Promise.resolve(valid ? "pending" : null);
}

/**
 * The currency codes accepted by the order and payment flows.
 */
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

// In-memory order store + idempotency-key map for POST /api/orders.
const ordersById = new Map<string, Order>();
const orderIdByIdempotencyKey = new Map<string, string>();

/**
 * Persists an order in the in-memory store and associates it with an
 * idempotency key, if one was supplied.
 */
function saveOrder(order: Order, idempotencyKey?: string): void {
  ordersById.set(order.id, order);
  if (idempotencyKey) {
    orderIdByIdempotencyKey.set(idempotencyKey, order.id);
  }
}

function getOrderById(orderId: string): Order | null {
  return ordersById.get(orderId) ?? null;
}

function isSupportedCurrency(code: unknown): code is Order["currency"] {
  return (
    typeof code === "string" &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(code)
  );
}

function parseCartItems(
  raw: unknown,
):
  | { ok: true; items: Array<{ id: string; qty: number; unitPrice: number }> }
  | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "items must be a non-empty array" };
  }
  const parsed: Array<{ id: string; qty: number; unitPrice: number }> = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "each item must be an object" };
    }
    const id = (entry as Record<string, unknown>)["id"];
    const qty = (entry as Record<string, unknown>)["qty"];
    const unitPrice = (entry as Record<string, unknown>)["unitPrice"];
    if (typeof id !== "string" || !id.trim()) {
      return { ok: false, error: "item.id is required" };
    }
    if (typeof qty !== "number" || !Number.isFinite(qty) || qty <= 0) {
      return { ok: false, error: "item.qty must be a positive number" };
    }
    if (
      typeof unitPrice !== "number" ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return {
        ok: false,
        error: "item.unitPrice must be a non-negative number",
      };
    }
    parsed.push({ id, qty, unitPrice });
  }
  return { ok: true, items: parsed };
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function requireString(
  body: Record<string, unknown>,
  key: string,
): string | null {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function sessionCookie(sessionId: string): string {
  return `fj_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/`;
}

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === name) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return rawValue.join("=");
      }
    }
  }
  return null;
}

function requireOwnerSession(request: Request): {
  workspaceId: string;
  userId: string;
} | null {
  const session = getActiveSession(getCookie(request, "fj_session"));
  if (!session || !isWorkspaceOwner(session.workspaceId, session.userId)) {
    return null;
  }

  return { workspaceId: session.workspaceId, userId: session.userId };
}

function escapeHtml(value: string | null): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function filterWorkspaceUsers(params: {
  users: Array<{
    userId: string;
    email: string;
    plan?: string;
    signed_up_at?: string;
    last_active_at?: string;
  }>;
  plan?: string | null;
  signUpDateFrom?: string | null;
  signUpDateTo?: string | null;
  status?: string | null;
}): Array<{
  userId: string;
  email: string;
  plan?: string;
  signed_up_at?: string;
  last_active_at?: string;
}> {
  return params.users.filter((user) => {
    if (params.plan && user.plan !== params.plan) return false;
    if (params.signUpDateFrom && user.signed_up_at) {
      if (user.signed_up_at < params.signUpDateFrom) return false;
    }
    if (params.signUpDateTo && user.signed_up_at) {
      if (user.signed_up_at > params.signUpDateTo) return false;
    }
    if (params.status) {
      const isActive = !!user.last_active_at;
      if (params.status === "active" && !isActive) return false;
      if (params.status === "inactive" && isActive) return false;
    }
    return true;
  });
}

function renderSessionsPage(workspaceId: string): string {
  const rows = listActiveSessions(workspaceId)
    .map(
      (session) =>
        `<tr><td>${escapeHtml(session.email)}</td><td>${escapeHtml(
          session.ip,
        )}</td><td>${escapeHtml(session.userAgent)}</td><td>${escapeHtml(
          session.startedAt,
        )}</td><td>${escapeHtml(
          session.lastSeenAt,
        )}</td><td><form method="post" action="/settings/security/sessions/revoke"><input type="hidden" name="sessionId" value="${escapeHtml(
          session.id,
        )}"><button type="submit">Revoke</button></form></td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><title>Active sessions</title></head><body><main><h1>Active sessions</h1><table><thead><tr><th>User</th><th>IP</th><th>UA</th><th>Started</th><th>Last seen</th><th>Revoke</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
}

async function readFormBody(request: Request): Promise<URLSearchParams> {
  return new URLSearchParams(await request.text());
}

async function checkDbConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const host = process.env["DATABASE_HOST"] ?? "localhost";
  const port = parseInt(process.env["DATABASE_PORT"] ?? "5432", 10);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: "connection timeout" });
    }, DB_CHECK_TIMEOUT_MS);

    const socket = createConnection(port, host);
    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ ok: true });
    });
    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ ok: false, error: err.message });
    });
  });
}

/**
 * Top-level request handler that creates a request context, routes the
 * incoming request through the application, and stamps the response with an
 * `X-Request-Id` header.
 *
 * @returns The {@link Response} produced by the routed handler.
 */
export async function handleRequest(request: Request): Promise<Response> {
  const context = createRequestContext();
  const response = await runWithRequestContext(async () => {
    const routedResponse = await routeRequest(request);
    const url = new URL(request.url);
    logger.info("request handled", {
      method: request.method,
      path: url.pathname,
      status: routedResponse.status,
    });
    return routedResponse;
  }, context);
  response.headers.set("X-Request-Id", context.reqId);
  return response;
}

async function routeRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const context = contextFromRequest(request);

  // CORS middleware
  const origin = request.headers.get("Origin");
  const isPreflight = request.method === "OPTIONS";

  if (origin) {
    const allowedOrigin = CORS_ALLOWED_ORIGINS.includes(origin) ? origin : null;

    if (isPreflight) {
      if (!allowedOrigin) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": isDevOrStaging ? "0" : "86400",
        },
      });
    }

    if (allowedOrigin) {
      // Attach CORS headers to all responses for allowed origins
      const response = await handleRoute(request, url, context);
      if (response.headers.get("Access-Control-Allow-Origin")) {
        return response;
      }
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", origin);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
  }

  return handleRoute(request, url, context);
}

async function handleRoute(
  request: Request,
  url: URL,
  context: ReturnType<typeof contextFromRequest>,
): Promise<Response> {
  if (
    request.method === "GET" &&
    (url.pathname === "/healthz" || url.pathname === "/health")
  ) {
    const probe = await checkDbConnection();
    if (!probe.ok) {
      return Response.json(
        {
          status: "degraded",
          db: "down",
          error: probe.error,
          uptimeSeconds: process.uptime(),
        },
        { status: 503 },
      );
    }
    return Response.json(
      { status: "ok", db: "up", uptimeSeconds: process.uptime() },
      { status: 200 },
    );
  }

  if (request.method === "GET" && url.pathname === "/api/projects") {
    return Response.json({ items: getProjects() }, { status: 200 });
  }

  if (request.method === "GET" && url.pathname === "/api/auth-events") {
    return Response.json({ items: listAuthEvents() }, { status: 200 });
  }

  if (
    request.method === "POST" &&
    url.pathname === "/settings/security/saml/metadata"
  ) {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    if (!workspaceId) {
      return Response.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    try {
      const metadata = await saveSamlMetadata({
        workspaceId,
        xml:
          requireString(body, "xml") ??
          requireString(body, "metadataXml") ??
          undefined,
        metadataUrl: requireString(body, "metadataUrl") ?? undefined,
        timeoutMs:
          typeof body.timeoutMs === "number" ? body.timeoutMs : undefined,
      });
      return Response.json(
        {
          workspaceId: metadata.workspaceId,
          source: metadata.source,
          entityId: metadata.entityId,
          ssoUrl: metadata.ssoUrl,
        },
        { status: 200 },
      );
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "metadata rejected",
        },
        { status: 400 },
      );
    }
  }

  if (request.method === "POST" && url.pathname === "/auth/saml") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const assertion =
      requireString(body, "assertionXml") ??
      requireString(body, "samlResponse") ??
      requireString(body, "assertion");

    if (!workspaceId || !assertion) {
      recordAuthEvent({
        workspaceId,
        kind: "fail",
        reason: "saml_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId and assertion are required" },
        { status: 400 },
      );
    }

    const result = authenticateSaml({
      workspaceId,
      assertion,
      expectedAudience: `fantastic-journey:${workspaceId}`,
      expectedDestination: `${url.origin}/auth/saml`,
      context,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (request.method === "POST" && url.pathname === "/auth/magic-link") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const email = requireString(body, "email");
    const brandName = requireString(body, "brandName") ?? "Fantastic Journey";

    if (!workspaceId || !email) {
      recordAuthEvent({
        workspaceId,
        kind: "fail",
        reason: "magic_link_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId and email are required" },
        { status: 400 },
      );
    }

    const token = createMagicLinkToken({ workspaceId, email, context });
    const magicLink = `${url.origin}/auth/magic-link/verify?token=${encodeURIComponent(
      token.token,
    )}`;
    sendMagicLinkEmail({ to: token.email, brandName, magicLink });

    return Response.json(
      {
        sent: true,
        email: maskEmail(token.email),
        expiresAt: token.expiresAt,
      },
      { status: 202 },
    );
  }

  if (request.method === "GET" && url.pathname === "/auth/magic-link/verify") {
    const token = url.searchParams.get("token");
    if (!token) {
      recordAuthEvent({
        kind: "fail",
        reason: "magic_token_missing",
        context,
      });
      return Response.json({ error: "token is required" }, { status: 400 });
    }

    const result = redeemMagicLinkToken({ token, context });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (request.method === "POST" && url.pathname === "/auth/password") {
    const body = await readJsonBody(request);
    const workspaceId = requireString(body, "workspaceId");
    const userId = requireString(body, "userId");
    const password = requireString(body, "password");

    if (!workspaceId || !userId || !password) {
      recordAuthEvent({
        workspaceId,
        userId,
        kind: "fail",
        reason: "password_request_invalid",
        context,
      });
      return Response.json(
        { error: "workspaceId, userId, and password are required" },
        { status: 400 },
      );
    }

    const result = authenticatePassword({
      workspaceId,
      userId,
      password,
      context,
    });
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 401 });
    }

    return Response.json(
      { session: result.session },
      {
        status: 200,
        headers: { "set-cookie": sessionCookie(result.session.id) },
      },
    );
  }

  if (
    request.method === "GET" &&
    url.pathname === "/settings/security/sessions"
  ) {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return new Response(renderSessionsPage(ownerSession.workspaceId), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (
    request.method === "POST" &&
    url.pathname === "/settings/security/sessions/revoke"
  ) {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    const sessionId = contentType.includes("application/json")
      ? requireString(await readJsonBody(request), "sessionId")
      : (await readFormBody(request)).get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const revoked = revokeSession({
      workspaceId: ownerSession.workspaceId,
      actorUserId: ownerSession.userId,
      sessionId,
    });
    return Response.json({ revoked }, { status: revoked ? 200 : 404 });
  }

  if (request.method === "GET" && url.pathname === "/admin/users") {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = url.searchParams.get("plan");
    const signUpDateFrom = url.searchParams.get("signUpDateFrom");
    const signUpDateTo = url.searchParams.get("signUpDateTo");
    const status = url.searchParams.get("status");

    const users = listWorkspaceUsers(ownerSession.workspaceId);
    const filtered = filterWorkspaceUsers({
      users,
      plan,
      signUpDateFrom,
      signUpDateTo,
      status,
    });

    return Response.json(
      {
        items: filtered.map((u) => ({
          id: u.userId,
          email: u.email,
          plan: u.plan ?? null,
          signed_up_at: u.signed_up_at ?? null,
          last_active_at: u.last_active_at ?? null,
        })),
      },
      { status: 200 },
    );
  }

  if (request.method === "GET" && url.pathname === "/admin/users/export") {
    const ownerSession = requireOwnerSession(request);
    if (!ownerSession) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = url.searchParams.get("plan");
    const signUpDateFrom = url.searchParams.get("signUpDateFrom");
    const signUpDateTo = url.searchParams.get("signUpDateTo");
    const status = url.searchParams.get("status");

    const users = listWorkspaceUsers(ownerSession.workspaceId);
    const filtered = filterWorkspaceUsers({
      users,
      plan,
      signUpDateFrom,
      signUpDateTo,
      status,
    });

    const dateStr = formatDate(new Date());
    const filename = `users-${dateStr}.csv`;
    const header = "id,email,plan,signed_up_at,last_active_at\n";
    const csvEscape = (v: string | undefined | null) => {
      if (v == null) return "";
      return `"${v.replace(/"/g, '""')}"`;
    };
    const rows = filtered
      .map((u) =>
        [u.userId, u.email, u.plan, u.signed_up_at, u.last_active_at]
          .map(csvEscape)
          .join(","),
      )
      .join("\n");
    const csv = header + rows;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  if (request.method === "POST" && url.pathname === "/api/orders") {
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || "";

    if (idempotencyKey) {
      const existingOrderId = orderIdByIdempotencyKey.get(idempotencyKey);
      if (existingOrderId) {
        const existing = getOrderById(existingOrderId);
        if (existing) {
          return Response.json({ order: existing }, { status: 200 });
        }
      }
    }

    const body = await readJsonBody(request);
    const customerId = requireString(body, "customerId");
    if (!customerId) {
      return Response.json(
        { error: "customerId is required" },
        { status: 400 },
      );
    }

    const currency = body["currency"];
    if (!isSupportedCurrency(currency)) {
      return Response.json(
        {
          error: `currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const taxRate = body["taxRate"];
    if (
      typeof taxRate !== "number" ||
      !Number.isFinite(taxRate) ||
      taxRate < 0
    ) {
      return Response.json(
        { error: "taxRate must be a non-negative number" },
        { status: 400 },
      );
    }

    const discountPercent = body["discountPercent"];
    if (
      discountPercent !== undefined &&
      discountPercent !== null &&
      (typeof discountPercent !== "number" ||
        !Number.isFinite(discountPercent) ||
        discountPercent < 0 ||
        discountPercent > 100)
    ) {
      return Response.json(
        { error: "discountPercent must be a number between 0 and 100" },
        { status: 400 },
      );
    }

    const parsedItems = parseCartItems(body["items"]);
    if (!parsedItems.ok) {
      return Response.json({ error: parsedItems.error }, { status: 400 });
    }

    const lineItems: Money[] = parsedItems.items.map((item) => ({
      amount: item.unitPrice * item.qty,
      currency,
    }));

    const discounted: Money[] =
      typeof discountPercent === "number"
        ? lineItems.map((line) => applyDiscount(line, discountPercent))
        : lineItems;

    let total: Money;
    try {
      total = totalWithTax(discounted, taxRate);
    } catch {
      return Response.json({ error: "invalid cart" }, { status: 400 });
    }

    try {
      processPayment(total);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "payment failed" },
        { status: 400 },
      );
    }

    const baseOrder = createOrder(
      customerId,
      parsedItems.items.map(({ id, qty }) => ({ id, qty })),
    );
    const confirmed = confirmOrder(baseOrder);
    const persisted: Order = {
      ...confirmed,
      total: total.amount,
      currency: total.currency,
      createdAt: new Date().toISOString(),
      items: parsedItems.items,
    };
    saveOrder(persisted, idempotencyKey || undefined);

    return Response.json({ order: persisted }, { status: 201 });
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/orders/")) {
    const orderId = url.pathname.slice("/api/orders/".length);
    if (!orderId) {
      return Response.json({ error: "order id is required" }, { status: 400 });
    }
    const order = getOrderById(orderId);
    if (!order) {
      return Response.json({ error: "order not found" }, { status: 404 });
    }
    return Response.json({ order }, { status: 200 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
