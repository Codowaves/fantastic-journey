import { describe, it, expect, beforeEach } from "vitest";
import { OrderService } from "../service.js";
import {
  OrderNotFoundError,
  DuplicateOrderError,
  InvalidStateTransitionError,
} from "../errors.js";
import type { CreateOrderInput } from "../types.js";

describe("OrderService", () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
  });

  describe("createOrder", () => {
    it("should create a valid order", async () => {
      const input: CreateOrderInput = {
        customerId: "cust_123",
        items: [
          { id: "item_1", qty: 2, price: 10.0 },
          { id: "item_2", qty: 1, price: 25.0 },
        ],
        currency: "USD",
      };

      const order = await service.createOrder(input);

      expect(order.id).toMatch(/^ord_/);
      expect(order.customerId).toBe("cust_123");
      expect(order.total).toBe(45.0); // 2*10 + 1*25
      expect(order.currency).toBe("USD");
      expect(order.status).toBe("pending");
      expect(order.items).toHaveLength(2);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it("should reject invalid input", async () => {
      const input = {
        customerId: "",
        items: [],
        currency: "USD",
      };

      await expect(service.createOrder(input as CreateOrderInput)).rejects.toThrow();
    });

    it("should enforce idempotency", async () => {
      const input: CreateOrderInput = {
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
        idempotencyKey: "key_123",
      };

      await service.createOrder(input);
      await expect(service.createOrder(input)).rejects.toThrow(DuplicateOrderError);
    });

    it("should calculate total correctly", async () => {
      const input: CreateOrderInput = {
        customerId: "cust_123",
        items: [
          { id: "item_1", qty: 3, price: 15.5 },
          { id: "item_2", qty: 2, price: 7.25 },
        ],
        currency: "EUR",
      };

      const order = await service.createOrder(input);
      expect(order.total).toBe(61); // 3*15.5 + 2*7.25 = 46.5 + 14.5
    });
  });

  describe("getOrder", () => {
    it("should retrieve an existing order", async () => {
      const input: CreateOrderInput = {
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      };

      const created = await service.createOrder(input);
      const retrieved = await service.getOrder(created.id);

      expect(retrieved).toEqual(created);
    });

    it("should throw OrderNotFoundError for non-existent order", async () => {
      await expect(service.getOrder("ord_nonexistent")).rejects.toThrow(OrderNotFoundError);
    });
  });

  describe("listOrders", () => {
    it("should list all orders", async () => {
      await service.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });
      await service.createOrder({
        customerId: "cust_2",
        items: [{ id: "item_2", qty: 1, price: 20.0 }],
        currency: "USD",
      });

      const orders = await service.listOrders();
      expect(orders).toHaveLength(2);
    });

    it("should filter orders by customer", async () => {
      await service.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });
      await service.createOrder({
        customerId: "cust_2",
        items: [{ id: "item_2", qty: 1, price: 20.0 }],
        currency: "USD",
      });

      const orders = await service.listOrders("cust_1");
      expect(orders).toHaveLength(1);
      expect(orders[0]!.customerId).toBe("cust_1");
    });
  });

  describe("updateOrderStatus", () => {
    it("should update status with valid transition", async () => {
      const order = await service.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      const updated = await service.updateOrderStatus({
        orderId: order.id,
        status: "confirmed",
      });

      expect(updated.status).toBe("confirmed");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it("should reject invalid state transition", async () => {
      const order = await service.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      await expect(
        service.updateOrderStatus({
          orderId: order.id,
          status: "delivered",
        }),
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it("should follow valid state transitions", async () => {
      const order = await service.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      const confirmed = await service.confirmOrder(order.id);
      expect(confirmed.status).toBe("confirmed");

      const shipped = await service.shipOrder(order.id);
      expect(shipped.status).toBe("shipped");

      const delivered = await service.deliverOrder(order.id);
      expect(delivered.status).toBe("delivered");
    });

    it("should allow cancellation from pending or confirmed", async () => {
      const order1 = await service.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });
      const cancelled1 = await service.cancelOrder(order1.id);
      expect(cancelled1.status).toBe("cancelled");

      const order2 = await service.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });
      await service.confirmOrder(order2.id);
      const cancelled2 = await service.cancelOrder(order2.id);
      expect(cancelled2.status).toBe("cancelled");
    });
  });
});
