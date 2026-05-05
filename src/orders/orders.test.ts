import { describe, it, expect } from "vitest";
import type { Order, OrderStore } from "./index.js";
import { createOrdersClient, validateCreateOrderInput, validateOrderId } from "./index.js";
import {
  OrderValidationError,
  OrderNotFoundError,
  OrderAlreadyConfirmedError,
} from "./index.js";

describe("OrdersClient", () => {
  describe("createOrder", () => {
    it("creates a basic order", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const result = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 2, priceUsd: 10 }],
      });
      expect(result.customerId).toBe("cust_1");
      expect(result.status).toBe("pending");
      expect(result.total).toBe(20);
      expect(result.currency).toBe("USD");
    });

    it("accepts currency option", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const result = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 100 }],
        currency: "EUR",
      });
      expect(result.currency).toBe("EUR");
    });

    it("throws on missing customerId", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      await expect(client.createOrder({ items: [{ id: "a", qty: 1, priceUsd: 10 }] }))
        .rejects.toThrow(OrderValidationError);
    });

    it("throws on empty items", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      await expect(client.createOrder({ customerId: "c", items: [] }))
        .rejects.toThrow(OrderValidationError);
    });

    it("throws on negative qty", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      await expect(client.createOrder({ customerId: "c", items: [{ id: "a", qty: -1, priceUsd: 10 }] }))
        .rejects.toThrow(OrderValidationError);
    });

    it("idempotency returns same order for same key", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const first = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 50 }],
        idempotencyKey: "idem_abc",
      });
      const second = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 50 }],
        idempotencyKey: "idem_abc",
      });
      expect(second.id).toBe(first.id);
    });

    it("accumulates total from multiple items", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const result = await client.createOrder({
        customerId: "cust_1",
        items: [
          { id: "item_a", qty: 2, priceUsd: 10 },
          { id: "item_b", qty: 1, priceUsd: 25 },
        ],
      });
      expect(result.total).toBe(45);
    });
  });

  describe("confirmOrder", () => {
    it("confirms a pending order", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const created = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 10 }],
      });
      const confirmed = await client.confirmOrder({ orderId: created.id });
      expect(confirmed.status).toBe("confirmed");
    });

    it("throws OrderNotFoundError for unknown order", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      await expect(client.confirmOrder({ orderId: "ord_unknown" }))
        .rejects.toThrow(OrderNotFoundError);
    });

    it("throws OrderAlreadyConfirmedError for non-pending order", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const created = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 10 }],
      });
      await client.confirmOrder({ orderId: created.id });
      await expect(client.confirmOrder({ orderId: created.id }))
        .rejects.toThrow(OrderAlreadyConfirmedError);
    });
  });

  describe("getOrder", () => {
    it("returns order by id", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const created = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_a", qty: 1, priceUsd: 10 }],
      });
      const found = await client.getOrder(created.id);
      expect(found?.id).toBe(created.id);
    });

    it("returns null for unknown id", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      const result = await client.getOrder("ord_nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("listOrders", () => {
    it("returns orders for a customer", async () => {
      const store = makeStore();
      const client = createOrdersClient({ store });
      await client.createOrder({ customerId: "cust_1", items: [{ id: "a", qty: 1, priceUsd: 10 }] });
      await client.createOrder({ customerId: "cust_1", items: [{ id: "b", qty: 1, priceUsd: 20 }] });
      await client.createOrder({ customerId: "cust_2", items: [{ id: "c", qty: 1, priceUsd: 30 }] });
      const orders = await client.listOrders("cust_1");
      expect(orders).toHaveLength(2);
    });
  });
});

describe("validateCreateOrderInput", () => {
  it("passes valid input", () => {
    const result = validateCreateOrderInput({
      customerId: "c1",
      items: [{ id: "i1", qty: 2, priceUsd: 10 }],
    });
    expect(result.customerId).toBe("c1");
  });

  it("rejects null input", () => {
    expect(() => validateCreateOrderInput(null)).toThrow(OrderValidationError);
  });

  it("rejects unknown currency", () => {
    expect(() => validateCreateOrderInput({
      customerId: "c1",
      items: [{ id: "i1", qty: 1, priceUsd: 10 }],
      currency: "XYZ",
    })).toThrow(OrderValidationError);
  });
});

describe("validateOrderId", () => {
  it("passes non-empty string", () => {
    expect(validateOrderId("ord_123")).toBe("ord_123");
  });

  it("rejects empty string", () => {
    expect(() => validateOrderId("")).toThrow(OrderValidationError);
  });

  it("trims whitespace", () => {
    expect(validateOrderId("  ord_123  ")).toBe("ord_123");
  });
});

function makeStore(): OrderStore {
  const store = new Map<string, Order>();

  return {
    async get(id) { return store.get(id) ?? null; },
    async put(order) { store.set(order.id, order); },
    async patch(id, patch) {
      const existing = store.get(id);
      if (!existing) throw new OrderNotFoundError(id);
      const updated = { ...existing, ...patch };
      store.set(id, updated);
      return updated;
    },
    async listByCustomer(cid) {
      return [...store.values()].filter((o) => o.customerId === cid);
    },
  };
}
