import { describe, it, expect, beforeEach } from "vitest";
import { createOrdersClient } from "../sdk.js";
import { metrics } from "../metrics.js";
import { alertManager } from "../alerts.js";
import { orderService } from "../service.js";
import type { CreateOrderInput } from "../types.js";

describe("Orders Integration", () => {
  beforeEach(() => {
    metrics.reset();
    orderService._reset();
  });

  describe("End-to-end order flow", () => {
    it("should complete full order lifecycle", async () => {
      const client = createOrdersClient();

      // Create order
      const input: CreateOrderInput = {
        customerId: "cust_integration_test",
        items: [
          { id: "item_1", qty: 2, price: 15.0 },
          { id: "item_2", qty: 1, price: 30.0 },
        ],
        currency: "USD",
      };

      const order = await client.createOrder(input);
      expect(order.status).toBe("pending");
      expect(order.total).toBe(60.0);

      // Confirm order
      const confirmed = await client.confirmOrder(order.id);
      expect(confirmed.status).toBe("confirmed");

      // Ship order
      const shipped = await client.shipOrder(order.id);
      expect(shipped.status).toBe("shipped");

      // Deliver order
      const delivered = await client.deliverOrder(order.id);
      expect(delivered.status).toBe("delivered");

      // Verify metrics were recorded
      const summary = metrics.getCounter("order.created");
      expect(summary).toBeGreaterThan(0);
    });

    it("should handle multiple customers", async () => {
      const client = createOrdersClient();

      const order1 = await client.createOrder({
        customerId: "cust_1",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      const order2 = await client.createOrder({
        customerId: "cust_2",
        items: [{ id: "item_2", qty: 1, price: 20.0 }],
        currency: "EUR",
      });

      const cust1Orders = await client.listOrders("cust_1");
      expect(cust1Orders).toHaveLength(1);
      expect(cust1Orders[0]!.id).toBe(order1.id);

      const cust2Orders = await client.listOrders("cust_2");
      expect(cust2Orders).toHaveLength(1);
      expect(cust2Orders[0]!.id).toBe(order2.id);
    });
  });

  describe("Metrics and monitoring", () => {
    it("should track order creation metrics", async () => {
      const client = createOrdersClient();
      metrics.reset();

      await client.createOrder({
        customerId: "cust_metrics",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      const createdCount = metrics.getCounter("order.created");
      expect(createdCount).toBe(1);

      const latencyStats = metrics.getHistogramStats("order.latency", { operation: "create" });
      expect(latencyStats).not.toBeNull();
      expect(latencyStats!.count).toBe(1);
    });

    it("should track status change metrics", async () => {
      const client = createOrdersClient();
      metrics.reset();

      const order = await client.createOrder({
        customerId: "cust_metrics",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      await client.confirmOrder(order.id);

      const statusChangeCount = metrics.getCounter("order.status_change");
      expect(statusChangeCount).toBe(1);
    });

    it("should calculate error rate", async () => {
      metrics.reset();

      // Simulate some successful operations
      metrics.recordCounter("order.created", 1);
      metrics.recordCounter("order.created", 1);
      metrics.recordCounter("order.created", 1);

      // Simulate an error
      metrics.recordCounter("order.error", 1);

      const errorRate = metrics.getErrorRate();
      expect(errorRate).toBeGreaterThan(0);
      expect(errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe("Alert system", () => {
    it("should start and stop alert manager", () => {
      alertManager.start();
      expect(alertManager.getActiveAlerts()).toEqual([]);

      alertManager.stop();
    });
  });

  describe("Idempotency", () => {
    it("should prevent duplicate orders with same idempotency key", async () => {
      const client = createOrdersClient();

      const input: CreateOrderInput = {
        customerId: "cust_idem",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
        idempotencyKey: "unique_key_123",
      };

      await client.createOrder(input);
      await expect(client.createOrder(input)).rejects.toThrow();
    });

    it("should allow different orders with different idempotency keys", async () => {
      const client = createOrdersClient();

      const order1 = await client.createOrder({
        customerId: "cust_idem",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
        idempotencyKey: "key_1",
      });

      const order2 = await client.createOrder({
        customerId: "cust_idem",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
        idempotencyKey: "key_2",
      });

      expect(order1.id).not.toBe(order2.id);
    });
  });

  describe("Error handling", () => {
    it("should handle validation errors gracefully", async () => {
      const client = createOrdersClient();

      await expect(
        client.createOrder({
          customerId: "",
          items: [],
          currency: "USD",
        } as CreateOrderInput),
      ).rejects.toThrow();
    });

    it("should handle invalid state transitions", async () => {
      const client = createOrdersClient();

      const order = await client.createOrder({
        customerId: "cust_error",
        items: [{ id: "item_1", qty: 1, price: 10.0 }],
        currency: "USD",
      });

      // Try to skip directly to delivered (invalid)
      await expect(client.deliverOrder(order.id)).rejects.toThrow();
    });
  });
});
