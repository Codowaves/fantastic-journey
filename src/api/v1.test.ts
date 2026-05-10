import { describe, it, expect } from "vitest";
import {
  type Order,
  createOrder,
  confirmOrder,
  getOrderStatus,
  SUPPORTED_CURRENCIES,
} from "./v1.js";

describe("createOrder", () => {
  it("creates an order with pending status", () => {
    const order = createOrder("cust_123", [
      { id: "item_1", qty: 2 },
      { id: "item_2", qty: 1 },
    ]);

    expect(order).toMatchObject({
      customerId: "cust_123",
      total: 2,
      status: "pending",
    });
    expect(order.id).toMatch(/^ord_\d+$/);
  });

  it("handles empty items array", () => {
    const order = createOrder("cust_456", []);

    expect(order.customerId).toBe("cust_456");
    expect(order.total).toBe(0);
    expect(order.status).toBe("pending");
  });

  it("generates IDs with ord_ prefix and timestamp", () => {
    const order = createOrder("cust_1", [{ id: "item", qty: 1 }]);

    expect(order.id).toMatch(/^ord_\d+$/);
    const timestamp = parseInt(order.id.replace("ord_", ""), 10);
    expect(timestamp).toBeGreaterThan(0);
  });
});

describe("confirmOrder", () => {
  it("updates order status to confirmed", () => {
    const pendingOrder: Order = {
      id: "ord_123",
      customerId: "cust_123",
      total: 100,
      status: "pending",
    };

    const confirmed = confirmOrder(pendingOrder);

    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.id).toBe(pendingOrder.id);
    expect(confirmed.customerId).toBe(pendingOrder.customerId);
    expect(confirmed.total).toBe(pendingOrder.total);
  });

  it("does not mutate the original order", () => {
    const original: Order = {
      id: "ord_456",
      customerId: "cust_456",
      total: 200,
      status: "pending",
    };

    confirmOrder(original);

    expect(original.status).toBe("pending");
  });

  it("works with already-shipped orders", () => {
    const shippedOrder: Order = {
      id: "ord_789",
      customerId: "cust_789",
      total: 300,
      status: "shipped",
    };

    const result = confirmOrder(shippedOrder);

    expect(result.status).toBe("confirmed");
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

  it("returns pending for any truthy order ID", async () => {
    const status1 = await getOrderStatus("ord_any");
    const status2 = await getOrderStatus("different_id");

    expect(status1).toBe("pending");
    expect(status2).toBe("pending");
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("exports the expected currency list", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(["USD", "EUR", "GBP", "JPY"]);
  });

  it("contains exactly 4 currencies", () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(4);
  });

  it("is readonly (type check at compile time)", () => {
    // TypeScript enforces readonly at compile time
    // This test verifies the array contents are stable
    expect(SUPPORTED_CURRENCIES.includes("USD")).toBe(true);
    expect(SUPPORTED_CURRENCIES.includes("EUR")).toBe(true);
  });
});

describe("Order interface", () => {
  it("allows creation of valid order objects", () => {
    const order: Order = {
      id: "ord_test",
      customerId: "cust_test",
      total: 500,
      status: "delivered",
    };

    expect(order.id).toBe("ord_test");
    expect(order.status).toBe("delivered");
  });

  it("supports all status values", () => {
    const statuses: Order["status"][] = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
    ];

    statuses.forEach((status) => {
      const order: Order = {
        id: "ord_test",
        customerId: "cust_test",
        total: 100,
        status,
      };
      expect(order.status).toBe(status);
    });
  });
});
