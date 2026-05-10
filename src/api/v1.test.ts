import { describe, it, expect } from "vitest";
import { createOrder, confirmOrder, getOrderStatus, SUPPORTED_CURRENCIES } from "./v1";

describe("createOrder", () => {
  it("creates an order with valid customerId", () => {
    const order = createOrder("cust_123", [
      { id: "item1", qty: 2 },
      { id: "item2", qty: 1 },
    ]);

    expect(order.id).toMatch(/^ord_\d+$/);
    expect(order.customerId).toBe("cust_123");
    expect(order.total).toBe(2);
    expect(order.status).toBe("pending");
  });

  it("throws when customerId is invalid", () => {
    expect(() => createOrder("invalid_id", [])).toThrow("Invalid customerId");
    expect(() => createOrder("", [])).toThrow("Invalid customerId");
  });
});

describe("confirmOrder", () => {
  it("updates order status to confirmed", () => {
    const order = {
      id: "ord_123",
      customerId: "cust_456",
      total: 100,
      status: "pending" as const,
    };

    const confirmed = confirmOrder(order);

    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.id).toBe(order.id);
  });
});

describe("getOrderStatus", () => {
  it("returns pending for valid order ID", async () => {
    const status = await getOrderStatus("ord_123");
    expect(status).toBe("pending");
  });

  it("returns null for empty order ID", async () => {
    const status = await getOrderStatus("");
    expect(status).toBe(null);
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("includes expected currencies", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(["USD", "EUR", "GBP", "JPY"]);
  });
});
