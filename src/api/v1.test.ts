import { describe, it, expect } from "vitest";
import {
  Order,
  createOrder,
  confirmOrder,
  getOrderStatus,
  SUPPORTED_CURRENCIES,
} from "./v1";

describe("createOrder", () => {
  it("creates a new order with pending status", () => {
    const customerId = "cust_123";
    const items = [
      { id: "item_1", qty: 2 },
      { id: "item_2", qty: 1 },
    ];

    const order = createOrder(customerId, items);

    expect(order.id).toMatch(/^ord_\d+$/);
    expect(order.customerId).toBe(customerId);
    expect(order.total).toBe(2);
    expect(order.status).toBe("pending");
  });

  it("handles empty items array", () => {
    const customerId = "cust_456";
    const items: Array<{ id: string; qty: number }> = [];

    const order = createOrder(customerId, items);

    expect(order.customerId).toBe(customerId);
    expect(order.total).toBe(0);
    expect(order.status).toBe("pending");
  });
});

describe("confirmOrder", () => {
  it("updates order status to confirmed", () => {
    const originalOrder: Order = {
      id: "ord_123",
      customerId: "cust_123",
      total: 100,
      status: "pending",
    };

    const confirmedOrder = confirmOrder(originalOrder);

    expect(confirmedOrder.status).toBe("confirmed");
    expect(confirmedOrder.id).toBe(originalOrder.id);
    expect(confirmedOrder.customerId).toBe(originalOrder.customerId);
    expect(confirmedOrder.total).toBe(originalOrder.total);
  });

  it("does not mutate the original order", () => {
    const originalOrder: Order = {
      id: "ord_456",
      customerId: "cust_456",
      total: 200,
      status: "pending",
    };

    const confirmedOrder = confirmOrder(originalOrder);

    expect(originalOrder.status).toBe("pending");
    expect(confirmedOrder.status).toBe("confirmed");
    expect(confirmedOrder).not.toBe(originalOrder);
  });
});

describe("getOrderStatus", () => {
  it("returns pending status for valid order ID", async () => {
    const status = await getOrderStatus("ord_123");

    expect(status).toBe("pending");
  });

  it("returns null for empty order ID", async () => {
    const status = await getOrderStatus("");

    expect(status).toBeNull();
  });

  it("returns null for falsy order ID", async () => {
    const status1 = await getOrderStatus("");
    const status2 = await getOrderStatus(null as any);
    const status3 = await getOrderStatus(undefined as any);

    expect(status1).toBeNull();
    expect(status2).toBeNull();
    expect(status3).toBeNull();
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("contains expected currency codes", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(["USD", "EUR", "GBP", "JPY"]);
  });

  it("has correct length", () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(4);
  });

  it("includes USD", () => {
    expect(SUPPORTED_CURRENCIES).toContain("USD");
  });
});
