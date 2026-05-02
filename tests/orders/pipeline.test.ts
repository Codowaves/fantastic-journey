import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OrdersPipeline } from "../../src/orders/pipeline.js";

describe("OrdersPipeline Integration", () => {
  let pipeline: OrdersPipeline;

  beforeEach(() => {
    pipeline = new OrdersPipeline({ maxRetries: 2, baseDelayMs: 10 });
  });

  afterEach(() => {
    pipeline.reset();
  });

  describe("processOrder", () => {
    it("creates an order successfully", async () => {
      const result = await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.customerId).toBe("cust_123");
        expect(result.data.status).toBe("pending");
        expect(result.data.total).toBe(2);
      }
    });

    it("rejects invalid input", async () => {
      const result = await pipeline.processOrder({
        customerId: "",
        items: [{ id: "item_1", qty: 2 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("customerId");
      expect(result.retryable).toBe(false);
    });

    it("rejects empty items", async () => {
      const result = await pipeline.processOrder({
        customerId: "cust_123",
        items: [],
      });

      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);
    });

    it("returns idempotent result for same key", async () => {
      const input = {
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_key_123",
      };

      const result1 = await pipeline.processOrder(input);
      const result2 = await pipeline.processOrder(input);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result1.data && result2.success && result2.data) {
        expect(result1.data.id).toBe(result2.data.id);
      }
    });

    it("tracks metrics on successful creation", async () => {
      await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      const metrics = pipeline.getMetrics();
      expect(metrics.ordersProcessed).toBe(1);
      expect(metrics.ordersSucceeded).toBe(1);
      expect(metrics.ordersFailed).toBe(0);
    });

    it("tracks metrics on failed creation", async () => {
      await pipeline.processOrder({
        customerId: "",
        items: [],
      });

      const metrics = pipeline.getMetrics();
      expect(metrics.ordersProcessed).toBe(1);
      expect(metrics.ordersSucceeded).toBe(0);
      expect(metrics.ordersFailed).toBe(1);
    });

    it("logs structured events", async () => {
      await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      const logs = pipeline.getLogger().getLogs();
      expect(logs.length).toBeGreaterThan(0);
      const orderLog = logs.find((l) => l.operation === "order_created");
      expect(orderLog).toBeDefined();
      if (orderLog?.metadata) {
        expect(orderLog.metadata.customerId).toBe("cust_123");
      }
    });
  });

  describe("confirmOrder", () => {
    it("confirms a pending order", async () => {
      const createResult = await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Order creation failed");
      }

      const confirmResult = await pipeline.confirmOrder(createResult.data.id);

      expect(confirmResult.success).toBe(true);
      if (confirmResult.success && confirmResult.data) {
        expect(confirmResult.data.status).toBe("confirmed");
      }
    });

    it("fails for non-existent order", async () => {
      const result = await pipeline.confirmOrder("non_existent_id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("order_not_found");
      expect(result.retryable).toBe(false);
    });

    it("logs confirmation events", async () => {
      const createResult = await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Order creation failed");
      }

      await pipeline.confirmOrder(createResult.data.id);

      const logs = pipeline.getLogger().getLogs();
      const confirmLog = logs.find((l) => l.operation === "order_confirmed");
      expect(confirmLog).toBeDefined();
    });
  });

  describe("getOrder", () => {
    it("retrieves an existing order", async () => {
      const createResult = await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Order creation failed");
      }

      const order = await pipeline.getOrder(createResult.data.id);

      expect(order).toBeDefined();
      if (order) {
        expect(order.id).toBe(createResult.data.id);
        expect(order.customerId).toBe("cust_123");
      }
    });

    it("returns null for non-existent order", async () => {
      const order = await pipeline.getOrder("non_existent_id");
      expect(order).toBeNull();
    });
  });

  describe("getOrderStatus", () => {
    it("returns order status", async () => {
      const createResult = await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Order creation failed");
      }

      const statusResult = await pipeline.getOrderStatus(createResult.data.id);

      expect(statusResult.success).toBe(true);
      if (statusResult.success) {
        expect(statusResult.data).toBe("pending");
      }
    });

    it("returns error for non-existent order", async () => {
      const result = await pipeline.getOrderStatus("non_existent_id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("order_not_found");
      expect(result.retryable).toBe(false);
    });
  });

  describe("metrics aggregation", () => {
    it("calculates average duration", async () => {
      await pipeline.processOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      const metrics = pipeline.getMetrics();
      expect(metrics.avgDurationMs).toBeGreaterThanOrEqual(0);
    });

    it("tracks idempotency hits", async () => {
      const input = {
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "idem_key",
      };

      await pipeline.processOrder(input);
      await pipeline.processOrder(input);

      const metrics = pipeline.getMetrics();
      expect(metrics.idempotencyHits).toBe(1);
    });
  });
});
