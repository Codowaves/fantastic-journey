import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createOrdersSdk, OrdersSdk } from "../../src/orders/sdk.js";

describe("OrdersSdk", () => {
  let sdk: OrdersSdk;

  beforeEach(() => {
    sdk = createOrdersSdk({ maxRetries: 2, baseDelayMs: 10 });
  });

  afterEach(() => {
    // SDK doesn't expose reset, but we create new instances per test
  });

  describe("createOrder", () => {
    it("creates an order successfully", async () => {
      const result = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      expect(result.success).toBe(true);
      expect(result.data?.customerId).toBe("cust_123");
      expect(result.data?.status).toBe("pending");
    });

    it("returns error for invalid input", async () => {
      const result = await sdk.createOrder({
        customerId: "",
        items: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("supports idempotency", async () => {
      const result1 = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "test-key",
      });

      const result2 = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
        idempotencyKey: "test-key",
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.id).toBe(result2.data?.id);
    });
  });

  describe("confirmOrder", () => {
    it("confirms an existing order", async () => {
      const createResult = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Failed to create order");
      }

      const confirmResult = await sdk.confirmOrder(createResult.data.id);

      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data?.status).toBe("confirmed");
    });

    it("fails for non-existent order", async () => {
      const result = await sdk.confirmOrder("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("order_not_found");
    });
  });

  describe("getOrder", () => {
    it("retrieves an order by id", async () => {
      const createResult = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Failed to create order");
      }

      const order = await sdk.getOrder(createResult.data.id);

      expect(order).toBeDefined();
      expect(order?.id).toBe(createResult.data.id);
    });

    it("returns null for non-existent order", async () => {
      const order = await sdk.getOrder("non-existent");
      expect(order).toBeNull();
    });
  });

  describe("getOrderStatus", () => {
    it("returns order status", async () => {
      const createResult = await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Failed to create order");
      }

      const statusResult = await sdk.getOrderStatus(createResult.data.id);

      expect(statusResult.success).toBe(true);
      expect(statusResult.data).toBe("pending");
    });

    it("returns error for non-existent order", async () => {
      const result = await sdk.getOrderStatus("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("order_not_found");
    });
  });

  describe("getMetrics", () => {
    it("returns pipeline metrics", async () => {
      await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      const metrics = sdk.getMetrics();

      expect(metrics.ordersProcessed).toBe(1);
      expect(metrics.ordersSucceeded).toBe(1);
    });
  });

  describe("getLogs", () => {
    it("returns structured logs", async () => {
      await sdk.createOrder({
        customerId: "cust_123",
        items: [{ id: "item_1", qty: 2 }],
      });

      const logs = sdk.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]?.timestamp).toBeDefined();
    });
  });

  describe("createOrdersSdk factory", () => {
    it("creates sdk with custom config", () => {
      const customSdk = createOrdersSdk({
        maxRetries: 5,
        baseDelayMs: 50,
        maxDelayMs: 10000,
      });

      expect(customSdk).toBeInstanceOf(OrdersSdk);
    });
  });
});
