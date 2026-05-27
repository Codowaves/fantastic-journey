import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

describe("api v1 route handler", () => {
  beforeEach(() => {
    process.env.CONTACT_TRUST_PROXY = "true";
  });

  afterEach(() => {
    delete process.env.CONTACT_TRUST_PROXY;
  });

  it("returns healthy JSON for GET /healthz", async () => {
    const response = await handleRequest(new Request("https://example.com/healthz"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rejects oversized contact payloads from content length", async () => {
    const response = await handleRequest(
      contactRequest({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          message: "x".repeat(17 * 1024),
        },
        ip: "203.0.113.10",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid contact payload" });
  });

  it("rejects oversized streamed contact payloads without content length", async () => {
    const encoder = new TextEncoder();
    let chunksSent = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        chunksSent += 1;
        controller.enqueue(encoder.encode("x".repeat(10 * 1024)));

        if (chunksSent === 3) {
          controller.close();
        }
      },
    });

    const response = await handleRequest(
      new Request("https://example.com/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.15",
        },
        body,
        duplex: "half",
      } as RequestInit & { duplex: "half" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid contact payload" });
  });

  it("rejects contact payloads missing email", async () => {
    const response = await handleRequest(
      contactRequest({
        body: {
          name: "Ada Lovelace",
          message: "Please contact me.",
        },
        ip: "203.0.113.11",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid contact payload" });
  });

  it("rejects HTML injection in contact names", async () => {
    const response = await handleRequest(
      contactRequest({
        body: {
          name: "<script>alert(1)</script>",
          email: "ada@example.com",
          message: "Please contact me.",
        },
        ip: "203.0.113.12",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid contact payload" });
  });

  it("rejects extra contact payload fields", async () => {
    const response = await handleRequest(
      contactRequest({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          message: "Please contact me.",
          role: "admin",
        },
        ip: "203.0.113.16",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid contact payload" });
  });

  it("accepts valid contact payloads", async () => {
    const response = await handleRequest(
      contactRequest({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          message: "Please contact me.",
        },
        ip: "203.0.113.13",
      }),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ status: "accepted" });
  });

  it("rate limits contact requests by trusted client IP", async () => {
    const ip = "203.0.113.14";

    for (let requestCount = 0; requestCount < 5; requestCount += 1) {
      const response = await handleRequest(
        contactRequest({
          body: {
            name: "Ada Lovelace",
            email: "ada@example.com",
            message: "Please contact me.",
          },
          ip,
        }),
      );

      expect(response.status).toBe(202);
    }

    const response = await handleRequest(
      contactRequest({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          message: "Please contact me.",
        },
        ip,
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "Too many requests" });
  });

  it("does not trust arbitrary x-forwarded-for for contact rate limiting", async () => {
    delete process.env.CONTACT_TRUST_PROXY;

    for (let requestCount = 0; requestCount < 5; requestCount += 1) {
      const response = await handleRequest(contactRequestWithForwardedFor(`203.0.113.${20 + requestCount}`));

      expect(response.status).toBe(202);
    }

    const response = await handleRequest(contactRequestWithForwardedFor("203.0.113.25"));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "Too many requests" });
  });
});

function contactRequest({ body, ip }: { body: unknown; ip: string }): Request {
  const rawBody = JSON.stringify(body);

  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: {
      "content-length": String(new TextEncoder().encode(rawBody).byteLength),
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody,
  });
}

function contactRequestWithForwardedFor(ip: string): Request {
  const rawBody = JSON.stringify({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Please contact me.",
  });

  return new Request("https://example.com/api/contact", {
    method: "POST",
    headers: {
      "content-length": String(new TextEncoder().encode(rawBody).byteLength),
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody,
  });
}
