import { describe, it, expect, beforeEach } from "vitest";
import { OrderService } from "./service.js";
import { OrderValidationError, OrderNotFoundError } from "./errors.js";
import { clearIdempotencyStore } from "./idempotency.js";
import { metrics } from "./metrics.js";
import type { CreateOrderInput } from "./types.js";

let seq = 0;
function makeInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  seq++;
  return {
    customerId: "cust_123",
    items: [{ id: "item_1", qty: 2 }],
    idempotencyKey: `idem_${Date.now()}_${seq}`,
    ...overrides,
  };
}

describe("OrderService", () => {
  beforeEach(() => {
    clearIdempotencyStore();
  });

  describe("createOrder", () => {
    it("creates an order with pending status", async () => {
      const service = new OrderService();
      const order = await service.createOrder(makeInput());
      expect(order.status).toBe("pending");
      expect(order.customerId).toBe("cust_123");
      expect(order.items).toHaveLength(1);
    });

    it("reuses idempotent order for same key", async () => {
      const service = new OrderService();
      const input = makeInput();
      const first = await service.createOrder(input);
      const second = await service.createOrder(input);
      expect(second.id).toBe(first.id);
    });

    it("throws on invalid input", async () => {
      const service = new OrderService();
      await expect(
        service.createOrder(makeInput({ customerId: "" }))
      ).rejects.toThrow(OrderValidationError);
    });

    it("reports metrics increment", async () => {
      metrics.reset();
      const service = new OrderService();
      await service.createOrder(makeInput());
      const m = service.getMetrics();
      expect(m.ordersCreated).toBe(1);
    });
  });

  describe("confirmOrder", () => {
    it("confirms a pending order", async () => {
      const service = new OrderService();
      const order = await service.createOrder(makeInput());
      const confirmed = await service.confirmOrder(order.id);
      expect(confirmed.status).toBe("confirmed");
    });

    it("throws for unknown order", async () => {
      const service = new OrderService();
      await expect(service.confirmOrder("ord_unknown")).rejects.toThrow(OrderNotFoundError);
    });

    it("throws when confirming non-pending order", async () => {
      const service = new OrderService();
      const order = await service.createOrder(makeInput());
      await service.confirmOrder(order.id);
      await expect(service.confirmOrder(order.id)).rejects.toThrow();
    });
  });

  describe("getOrder", () => {
    it("returns null for unknown order", async () => {
      const service = new OrderService();
      const result = await service.getOrder("ord_unknown");
      expect(result).toBeNull();
    });

    it("returns existing order", async () => {
      const service = new OrderService();
      const created = await service.createOrder(makeInput());
      const found = await service.getOrder(created.id);
      expect(found?.id).toBe(created.id);
    });
  });

  describe("listOrders", () => {
    it("returns empty list initially", async () => {
      const service = new OrderService();
      const orders = await service.listOrders();
      expect(orders).toHaveLength(0);
    });

    it("lists created orders", async () => {
      const service = new OrderService();
      await service.createOrder(makeInput());
      await service.createOrder(makeInput({ customerId: "cust_456" }));
      const orders = await service.listOrders();
      expect(orders).toHaveLength(2);
    });

    it("filters by customerId", async () => {
      const service = new OrderService();
      await service.createOrder(makeInput({ customerId: "cust_aaa" }));
      await service.createOrder(makeInput({ customerId: "cust_bbb" }));
      const orders = await service.listOrders("cust_aaa");
      expect(orders).toHaveLength(1);
      expect(orders[0]!.customerId).toBe("cust_aaa");
    });
  });

  describe("updateStatus", () => {
    it("updates order status", async () => {
      const service = new OrderService();
      const order = await service.createOrder(makeInput());
      const updated = await service.updateStatus(order.id, "shipped");
      expect(updated.status).toBe("shipped");
    });

    it("throws for unknown order", async () => {
      const service = new OrderService();
      await expect(service.updateStatus("ord_unknown", "shipped")).rejects.toThrow(OrderNotFoundError);
    });
  });
});