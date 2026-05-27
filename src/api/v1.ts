// Documenter bait — every public export is missing JSDoc.
// The documenter scanner should file one issue listing each undocumented
// export here.

import { z } from "zod";

const CONTACT_BODY_LIMIT_BYTES = 16 * 1024;
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const HTML_TAG_PATTERN = /<[^>]*>/;

const contactPayloadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .refine((value) => !HTML_TAG_PATTERN.test(value), "HTML tags are not allowed"),
    email: z.string().trim().email(),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

const contactRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

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

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/healthz") {
    return Response.json({ ok: true }, { status: 200 });
  }

  if (request.method === "POST" && url.pathname === "/api/contact") {
    return handleContactRequest(request);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

async function handleContactRequest(request: Request): Promise<Response> {
  const rateLimitResult = checkContactRateLimit(getClientIp(request));

  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
        },
      },
    );
  }

  if (isOversizedContentLength(request.headers.get("content-length"))) {
    return badContactRequest();
  }

  const rawBody = await readLimitedContactBody(request);

  if (rawBody === null) {
    return badContactRequest();
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return badContactRequest();
  }

  const validation = contactPayloadSchema.safeParse(payload);

  if (!validation.success) {
    return badContactRequest();
  }

  return acceptedContactResponse(validation.data);
}

function checkContactRateLimit(clientIp: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const bucket = contactRateLimitBuckets.get(clientIp);

  if (!bucket || bucket.resetAt <= now) {
    contactRateLimitBuckets.set(clientIp, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    });

    return { allowed: true };
  }

  if (bucket.count >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}

function getClientIp(request: Request): string {
  if (!trustsForwardedClientIp()) {
    return "anonymous";
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.trim();
  const [clientIp] = forwardedFor?.split(",") ?? [];

  if (clientIp?.trim()) {
    return clientIp.trim();
  }

  return "anonymous";
}

function trustsForwardedClientIp(): boolean {
  return process.env.CONTACT_TRUST_PROXY === "true";
}

function isOversizedContentLength(contentLength: string | null): boolean {
  if (contentLength === null) {
    return false;
  }

  const parsedContentLength = Number(contentLength);

  return Number.isFinite(parsedContentLength) && parsedContentLength > CONTACT_BODY_LIMIT_BYTES;
}

async function readLimitedContactBody(request: Request): Promise<string | null> {
  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    let readResult = await reader.read();

    while (!readResult.done) {
      const { value } = readResult;
      totalBytes += value.byteLength;

      if (totalBytes > CONTACT_BODY_LIMIT_BYTES) {
        return null;
      }

      chunks.push(value);
      readResult = await reader.read();
    }

    return new TextDecoder().decode(concatenateChunks(chunks, totalBytes));
  } finally {
    reader.releaseLock();
  }
}

function concatenateChunks(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

function badContactRequest(): Response {
  return Response.json({ error: "Invalid contact payload" }, { status: 400 });
}

function acceptedContactResponse(_payload: z.infer<typeof contactPayloadSchema>): Response {
  return Response.json({ status: "accepted" }, { status: 202 });
}

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
