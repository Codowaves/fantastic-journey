import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrdersPipeline } from "./pipeline.js";
import { InMemoryIdempotencyStore } from "./idempotency.js";
import { createErrorRateAlert } from "./logging.js";

const CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeInput(overrides = {}) {
  return {
    customerId: CUSTOMER_ID,
    items: [{ id: "item1", name: "Widget", quantity: 2, unitPrice: 10.99 }],
    ...overrides,
  };
}

describe("OrdersPipeline", () => {
  let store: InMemoryIdempotencyStore;
  let pipeline: OrdersPipeline;
  let alert: ReturnType<typeof createErrorRateAlert>;

  beforeEach(() => {
    store = new InMemoryIdempotencyStore();
    alert = createErrorRateAlert({
      errorRateThreshold: 3,
      windowMs: 1000,
      onAlert: vi.fn(),
    });
    pipeline = new OrdersPipeline({
      idempotencyStore: store,
      enableRetry: true,
      errorRateAlert: alert,
    });
  });

  describe("createOrder", () => {
    it("creates order with computed total", async () => {
      const result = await pipeline.createOrder(makeInput());
      expect(result.order.id).toMatch(/^ord_/);
      expect(result.order.total).toBeCloseTo(21.98);
      expect(result.order.status).toBe("pending");
      expect(result.events).toHaveLength(1);
      expect(result.events[0]!.type).toBe("order_created");
    });

    it("defaults currency to USD", async () => {
      const result = await pipeline.createOrder(makeInput());
      expect(result.order.currency).toBe("USD");
    });

    it("stores order in idempotency store", async () => {
      await pipeline.createOrder(makeInput({ idempotencyKey: "key1" }));
      expect(store.has("key1")).toBe(true);
    });

    it("returns same order on duplicate idempotency key", async () => {
      const r1 = await pipeline.createOrder(
        makeInput({ idempotencyKey: "key1" }),
      );
      const r2 = await pipeline.createOrder(
        makeInput({ idempotencyKey: "key1" }),
      );
      expect(r2.order.id).toBe(r1.order.id);
    });

    it("rejects invalid input", async () => {
      await expect(
        pipeline.createOrder({ customerId: "not-a-uuid", items: [] }),
      ).rejects.toThrow();
    });
  });

  describe("status transitions", () => {
    it("confirmOrder transitions to confirmed", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.confirmOrder(order.id);
      expect(result.order.status).toBe("confirmed");
    });

    it("processOrder transitions to processing", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.processOrder(order.id);
      expect(result.order.status).toBe("processing");
    });

    it("shipOrder transitions to shipped", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.shipOrder(order.id);
      expect(result.order.status).toBe("shipped");
    });

    it("deliverOrder transitions to delivered", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.deliverOrder(order.id);
      expect(result.order.status).toBe("delivered");
    });

    it("cancelOrder transitions to cancelled", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.cancelOrder(order.id);
      expect(result.order.status).toBe("cancelled");
    });

    it("throws for unknown order", async () => {
      await expect(pipeline.confirmOrder("ord_unknown")).rejects.toThrow(
        "not found",
      );
    });
  });

  describe("retry on transition", () => {
    it("transitions succeed without retry", async () => {
      const { order } = await pipeline.createOrder(makeInput());
      const result = await pipeline.confirmOrder(order.id);
      expect(result.order.status).toBe("confirmed");
    });
  });

  describe("error rate alert", () => {
    it("records errors via the alert", () => {
      alert.recordError();
      alert.recordError();
      alert.check();
    });
  });
});
