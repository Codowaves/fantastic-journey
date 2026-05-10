import { describe, it, expect, beforeEach } from "vitest";
import { OrdersSDK } from "./sdk.js";
import { orderService } from "./service.js";

describe("OrdersSDK", () => {
  let sdk: OrdersSDK;

  beforeEach(() => {
    sdk = new OrdersSDK();
    orderService.clearOrders();
  });

  it("should create an order through SDK", async () => {
    const input = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };

    const order = await sdk.createOrder(input);

    expect(order.customerId).toBe("cust-123");
    expect(order.total).toBe(10);
    expect(order.status).toBe("pending");
  });

  it("should confirm an order through SDK", async () => {
    const input = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };

    const order = await sdk.createOrder(input);
    const confirmed = await sdk.confirmOrder(order.id);

    expect(confirmed.status).toBe("confirmed");
  });

  it("should get an order through SDK", async () => {
    const input = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };

    const created = await sdk.createOrder(input);
    const fetched = await sdk.getOrder(created.id);

    expect(fetched).toEqual(created);
  });

  it("should get order status through SDK", async () => {
    const input = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };

    const order = await sdk.createOrder(input);
    const status = await sdk.getOrderStatus(order.id);

    expect(status).toBe("pending");
  });

  it("should update order status through SDK", async () => {
    const input = {
      customerId: "cust-123",
      items: [{ id: "item-1", qty: 1, pricePerUnit: 10 }],
    };

    const order = await sdk.createOrder(input);
    const updated = await sdk.updateOrderStatus(order.id, "shipped");

    expect(updated.status).toBe("shipped");
  });

  it("should get metrics through SDK", () => {
    const metrics = sdk.getMetrics();

    expect(metrics).toHaveProperty("ordersCreated");
    expect(metrics).toHaveProperty("ordersConfirmed");
    expect(metrics).toHaveProperty("ordersFailed");
    expect(metrics).toHaveProperty("totalRevenue");
    expect(metrics).toHaveProperty("errorRate");
    expect(metrics).toHaveProperty("averageOrderValue");
  });
});
