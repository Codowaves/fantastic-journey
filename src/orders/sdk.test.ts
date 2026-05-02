import { describe, it, expect, beforeEach } from "vitest";
import { createOrdersSDK } from "./sdk.js";
import { clearIdempotencyStore } from "./idempotency.js";
import type { CreateOrderInput } from "./types.js";

let seq = 0;
function makeInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  seq++;
  return {
    customerId: "cust_sdk",
    items: [{ id: "item_a", qty: 1 }],
    idempotencyKey: `idem_sdk_${Date.now()}_${seq}`,
    ...overrides,
  };
}

describe("OrdersSDK", () => {
  beforeEach(() => {
    clearIdempotencyStore();
  });

  it("creates order via SDK", async () => {
    const sdk = createOrdersSDK();
    const order = await sdk.createOrder(makeInput());
    expect(order.status).toBe("pending");
    sdk.shutdown();
  });

  it("confirms order via SDK", async () => {
    const sdk = createOrdersSDK();
    const order = await sdk.createOrder(makeInput());
    const confirmed = await sdk.confirmOrder(order.id);
    expect(confirmed.status).toBe("confirmed");
    sdk.shutdown();
  });

  it("gets order via SDK", async () => {
    const sdk = createOrdersSDK();
    const created = await sdk.createOrder(makeInput());
    const found = await sdk.getOrder(created.id);
    expect(found?.id).toBe(created.id);
    sdk.shutdown();
  });

  it("lists orders via SDK", async () => {
    const sdk = createOrdersSDK();
    await sdk.createOrder(makeInput());
    const orders = await sdk.listOrders();
    expect(orders.length).toBeGreaterThan(0);
    sdk.shutdown();
  });

  it("updates status via SDK", async () => {
    const sdk = createOrdersSDK();
    const order = await sdk.createOrder(makeInput());
    const updated = await sdk.updateStatus(order.id, "delivered");
    expect(updated.status).toBe("delivered");
    sdk.shutdown();
  });

  it("returns metrics", () => {
    const sdk = createOrdersSDK();
    const m = sdk.getMetrics();
    expect("ordersCreated" in m).toBe(true);
    sdk.shutdown();
  });
});