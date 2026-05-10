import { describe, it, expect, beforeEach, vi } from "vitest";
import { orderService } from "./service.js";
import { ValidationError } from "./types.js";

describe("OrderService", () => {
  beforeEach(() => {
    orderService.clearOrders();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  describe("createOrder", () => {
    it("should create a valid order", async () => {
      const input = {
        customerId: "cust-123",
        items: [
          { id: "item-1", qty: 2, pricePerUnit: 10.99 },
          { id: "item-2", qty: 1, pricePerUnit: 5.50 },
        ],
      };

      const order = await orderService.createOrder(input);

      expect(order.id).toBeDefined();
      expect(order.customerId).toBe("cust-123");
      expect(order.items).toEqual(input.items);
      expect(order.total).toBe(2 * 10.99 + 1 * 5.50);
      expect(order.status).toBe("pending");
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it("should reject invalid input", async () => {
      const invalidInput = {
        customerId: "",
        items: [],
      };

      await expect(orderService.createOrder(invalidInput)).rejects.toThrow();
    });

    it("should handle idempotency keys", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
        idempotencyKey: "key-123",
      };

      const order1 = await orderService.createOrder(input);
      const order2 = await orderService.createOrder(input);

      expect(order2.id).toBe(order1.id);
    });

    it("should track metrics on successful creation", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 100 }],
      };

      await orderService.createOrder(input);

      const metrics = orderService.getMetrics();
      expect(metrics.ordersCreated).toBe(1);
      expect(metrics.totalRevenue).toBe(100);
    });
  });

  describe("confirmOrder", () => {
    it("should confirm a pending order", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const order = await orderService.createOrder(input);
      const confirmed = await orderService.confirmOrder(order.id);

      expect(confirmed.status).toBe("confirmed");
      expect(confirmed.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it("should reject confirming non-existent order", async () => {
      await expect(orderService.confirmOrder("non-existent")).rejects.toThrow(ValidationError);
    });

    it("should reject confirming non-pending order", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const order = await orderService.createOrder(input);
      await orderService.confirmOrder(order.id);

      await expect(orderService.confirmOrder(order.id)).rejects.toThrow(ValidationError);
    });

    it("should track metrics on successful confirmation", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const order = await orderService.createOrder(input);
      await orderService.confirmOrder(order.id);

      const metrics = orderService.getMetrics();
      expect(metrics.ordersConfirmed).toBe(1);
    });
  });

  describe("getOrder", () => {
    it("should return an existing order", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const created = await orderService.createOrder(input);
      const fetched = await orderService.getOrder(created.id);

      expect(fetched).toEqual(created);
    });

    it("should return null for non-existent order", async () => {
      const fetched = await orderService.getOrder("non-existent");
      expect(fetched).toBeNull();
    });
  });

  describe("getOrderStatus", () => {
    it("should return status of an existing order", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const order = await orderService.createOrder(input);
      const status = await orderService.getOrderStatus(order.id);

      expect(status).toBe("pending");
    });

    it("should return null for non-existent order", async () => {
      const status = await orderService.getOrderStatus("non-existent");
      expect(status).toBeNull();
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
      };

      const order = await orderService.createOrder(input);
      const updated = await orderService.updateOrderStatus(order.id, "shipped");

      expect(updated.status).toBe("shipped");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it("should reject updating non-existent order", async () => {
      await expect(orderService.updateOrderStatus("non-existent", "shipped")).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("integration test", () => {
    it("should handle full order lifecycle", async () => {
      const input = {
        customerId: "cust-123",
        items: [
          { id: "item-1", qty: 2, pricePerUnit: 10 },
          { id: "item-2", qty: 1, pricePerUnit: 5 },
        ],
        idempotencyKey: "lifecycle-key",
      };

      const order = await orderService.createOrder(input);
      expect(order.status).toBe("pending");
      expect(order.total).toBe(25);

      const confirmed = await orderService.confirmOrder(order.id);
      expect(confirmed.status).toBe("confirmed");

      const shipped = await orderService.updateOrderStatus(order.id, "shipped");
      expect(shipped.status).toBe("shipped");

      const delivered = await orderService.updateOrderStatus(order.id, "delivered");
      expect(delivered.status).toBe("delivered");

      const final = await orderService.getOrder(order.id);
      expect(final?.status).toBe("delivered");

      const metrics = orderService.getMetrics();
      expect(metrics.ordersCreated).toBe(1);
      expect(metrics.ordersConfirmed).toBe(1);
      expect(metrics.totalRevenue).toBe(25);
    });

    it("should prevent duplicate orders with idempotency key", async () => {
      const input = {
        customerId: "cust-123",
        items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
        idempotencyKey: "duplicate-key",
      };

      const order1 = await orderService.createOrder(input);
      const order2 = await orderService.createOrder(input);

      expect(order1.id).toBe(order2.id);

      const metrics = orderService.getMetrics();
      expect(metrics.ordersCreated).toBe(1);
    });
  });
});
