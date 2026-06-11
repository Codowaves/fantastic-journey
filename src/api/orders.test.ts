import { beforeEach, describe, expect, it } from "vitest";

import { handleRequest } from "./v1";

function jsonRequest(
  url: string,
  init: { method: string; body?: unknown; headers?: Record<string, string> } = {
    method: "GET",
  },
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init.headers ?? {}),
  };
  return new Request(`https://example.com${url}`, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

describe("POST /api/orders checkout", () => {
  beforeEach(() => {
    // No-op; handleRequest is per-request and uses module-level state.
    // Tests rely on the order of execution within a single test file to
    // avoid cross-test contamination.
  });

  it("runs the 4-stage flow and returns a confirmed order", async () => {
    const response = await handleRequest(
      jsonRequest("/api/orders", {
        method: "POST",
        body: {
          customerId: "cust_1",
          currency: "USD",
          taxRate: 0.08,
          discountPercent: 10,
          items: [
            { id: "sku_a", qty: 2, unitPrice: 25 },
            { id: "sku_b", qty: 1, unitPrice: 10 },
          ],
        },
      }),
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      order: {
        id: string;
        customerId: string;
        total: number;
        currency: string;
        status: string;
        items: Array<{ id: string; qty: number; unitPrice: number }>;
      };
    };
    // Line items: [50, 10] -> with 10% discount: [45, 9] -> subtotal 54 -> *1.08 = 58.32
    expect(body.order).toMatchObject({
      customerId: "cust_1",
      total: 58.32,
      currency: "USD",
      status: "confirmed",
      items: [
        { id: "sku_a", qty: 2, unitPrice: 25 },
        { id: "sku_b", qty: 1, unitPrice: 10 },
      ],
    });
    expect(body.order.id).toMatch(/^ord_/);
  });

  it("returns the same order on idempotent replay without double-charging", async () => {
    const payload = {
      customerId: "cust_2",
      currency: "EUR",
      taxRate: 0,
      items: [{ id: "sku_x", qty: 1, unitPrice: 100 }],
    };
    const headers = { "Idempotency-Key": "key-abc-123" };

    const first = await handleRequest(
      jsonRequest("/api/orders", { method: "POST", body: payload, headers }),
    );
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as {
      order: { id: string; total: number };
    };

    const second = await handleRequest(
      jsonRequest("/api/orders", { method: "POST", body: payload, headers }),
    );
    expect(second.status).toBe(200);
    const secondBody = (await second.json()) as {
      order: { id: string; total: number };
    };

    expect(secondBody.order.id).toBe(firstBody.order.id);
    expect(secondBody.order.total).toBe(firstBody.order.total);
  });

  it("returns 400 when the currency is not in SUPPORTED_CURRENCIES", async () => {
    const response = await handleRequest(
      jsonRequest("/api/orders", {
        method: "POST",
        body: {
          customerId: "cust_3",
          currency: "XYZ",
          taxRate: 0,
          items: [{ id: "sku_a", qty: 1, unitPrice: 5 }],
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("currency"),
    });
  });

  it("returns 400 when the cart is empty", async () => {
    const response = await handleRequest(
      jsonRequest("/api/orders", {
        method: "POST",
        body: {
          customerId: "cust_4",
          currency: "USD",
          taxRate: 0,
          items: [],
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("items"),
    });
  });

  it("returns 400 when customerId is missing", async () => {
    const response = await handleRequest(
      jsonRequest("/api/orders", {
        method: "POST",
        body: {
          currency: "USD",
          taxRate: 0,
          items: [{ id: "sku_a", qty: 1, unitPrice: 5 }],
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("customerId"),
    });
  });
});

describe("GET /api/orders/:id status", () => {
  it("returns the persisted order for a valid id", async () => {
    const createResponse = await handleRequest(
      jsonRequest("/api/orders", {
        method: "POST",
        body: {
          customerId: "cust_5",
          currency: "GBP",
          taxRate: 0,
          items: [{ id: "sku_z", qty: 3, unitPrice: 4 }],
        },
      }),
    );
    const created = (await createResponse.json()) as { order: { id: string } };

    const getResponse = await handleRequest(
      new Request(`https://example.com/api/orders/${created.order.id}`),
    );

    expect(getResponse.status).toBe(200);
    await expect(getResponse.json()).resolves.toMatchObject({
      order: { id: created.order.id, currency: "GBP" },
    });
  });

  it("returns 404 for an unknown order id", async () => {
    const response = await handleRequest(
      new Request("https://example.com/api/orders/ord_does_not_exist"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "order not found",
    });
  });
});
