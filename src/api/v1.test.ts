import { describe, it, expect } from "vitest";
import { createOrder, confirmOrder, getOrderStatus } from "./v1.js";

describe("createOrder", () => {
  it("creates an order for a valid customerId", () => {
    const order = createOrder("cust_123", [{ id: "item1", qty: 2 }]);
    expect(order.id).toMatch(/^ord_/);
    expect(order.customerId).toBe("cust_123");
    expect(order.total).toBe(1);
    expect(order.status).toBe("pending");
  });

  it("throws for invalid customerId", () => {
    expect(() => createOrder("", [{ id: "item1", qty: 1 }])).toThrow("Invalid customerId");
    expect(() => createOrder("invalid", [{ id: "item1", qty: 1 }])).toThrow("Invalid customerId");
  });
});

describe("confirmOrder", () => {
  it("returns order with confirmed status", () => {
    const order = createOrder("cust_123", [{ id: "item1", qty: 1 }]);
    const confirmed = confirmOrder(order);
    expect(confirmed.status).toBe("confirmed");
  });
});

describe("getOrderStatus", () => {
  it("returns pending for valid orderId", async () => {
    const status = await getOrderStatus("ord_123");
    expect(status).toBe("pending");
  });

  it("returns null for empty orderId", async () => {
    const status = await getOrderStatus("");
    expect(status).toBeNull();
  });
});