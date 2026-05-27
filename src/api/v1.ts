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

const DB_CHECK_TIMEOUT_MS = parseInt(
  process.env["DB_CHECK_TIMEOUT_MS"] ?? "1000",
  10,
);

const CORS_ALLOWED_ORIGINS = (process.env["CORS_ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isDevOrStaging = process.env["NODE_ENV"] !== "production";

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

export async function handleRequest(request: Request): Promise<Response> {
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

  if (request.method === "GET" && url.pathname === "/api/version") {
    return Response.json(
      {
        sha: process.env.GIT_SHA ?? "dev",
        builtAt: process.env.BUILD_ISO ?? "dev",
        node: process.version,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
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

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
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

  return Response.json({ error: "Not found" }, { status: 404 });
}
