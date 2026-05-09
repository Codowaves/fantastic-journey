import { describe, it, expect } from "vitest";
import { createOrder, confirmOrder, getOrderStatus, SUPPORTED_CURRENCIES, type Order } from "./v1";

describe("createOrder", () => {
  it("should create order with valid customer and items", () => {
    const customerId = "cust_123";
    const items = [
      { id: "item_1", qty: 2 },
      { id: "item_2", qty: 1 },
    ];
    const order = createOrder(customerId, items);

    expect(order.customerId).toBe(customerId);
    expect(order.total).toBe(2);
    expect(order.status).toBe("pending");
    expect(order.id).toMatch(/^ord_\d+$/);
  });

  it("should generate order IDs with correct format", () => {
    const items = [{ id: "item_1", qty: 1 }];
    const order = createOrder("cust_1", items);

    expect(order.id).toMatch(/^ord_\d+$/);
    expect(order.id.startsWith("ord_")).toBe(true);
  });

  it("should handle empty items array", () => {
    const order = createOrder("cust_123", []);
    expect(order.total).toBe(0);
    expect(order.status).toBe("pending");
  });

  it("should handle single item", () => {
    const order = createOrder("cust_456", [{ id: "item_1", qty: 5 }]);
    expect(order.total).toBe(1);
  });

  it("should handle multiple items", () => {
    const items = [
      { id: "item_1", qty: 1 },
      { id: "item_2", qty: 2 },
      { id: "item_3", qty: 3 },
    ];
    const order = createOrder("cust_789", items);
    expect(order.total).toBe(3);
  });

  it("should preserve customer ID", () => {
    const customerId = "cust_special_123";
    const order = createOrder(customerId, [{ id: "x", qty: 1 }]);
    expect(order.customerId).toBe(customerId);
  });
});

describe("confirmOrder", () => {
  it("should change status from pending to confirmed", () => {
    const pendingOrder: Order = {
      id: "ord_123",
      customerId: "cust_456",
      total: 100,
      status: "pending",
    };
    const confirmed = confirmOrder(pendingOrder);

    expect(confirmed.status).toBe("confirmed");
  });

  it("should preserve all other order fields", () => {
    const order: Order = {
      id: "ord_789",
      customerId: "cust_999",
      total: 250,
      status: "pending",
    };
    const confirmed = confirmOrder(order);

    expect(confirmed.id).toBe(order.id);
    expect(confirmed.customerId).toBe(order.customerId);
    expect(confirmed.total).toBe(order.total);
  });

  it("should not mutate original order", () => {
    const original: Order = {
      id: "ord_111",
      customerId: "cust_222",
      total: 50,
      status: "pending",
    };
    const confirmed = confirmOrder(original);

    expect(original.status).toBe("pending");
    expect(confirmed.status).toBe("confirmed");
  });

  it("should handle already confirmed order", () => {
    const order: Order = {
      id: "ord_555",
      customerId: "cust_666",
      total: 150,
      status: "confirmed",
    };
    const result = confirmOrder(order);

    expect(result.status).toBe("confirmed");
  });

  it("should handle shipped order", () => {
    const order: Order = {
      id: "ord_777",
      customerId: "cust_888",
      total: 200,
      status: "shipped",
    };
    const result = confirmOrder(order);

    expect(result.status).toBe("confirmed");
  });

  it("should handle delivered order", () => {
    const order: Order = {
      id: "ord_999",
      customerId: "cust_000",
      total: 300,
      status: "delivered",
    };
    const result = confirmOrder(order);

    expect(result.status).toBe("confirmed");
  });
});

describe("getOrderStatus", () => {
  it("should return pending for non-empty order ID", async () => {
    const status = await getOrderStatus("ord_123");
    expect(status).toBe("pending");
  });

  it("should return null for empty order ID", async () => {
    const status = await getOrderStatus("");
    expect(status).toBe(null);
  });

  it("should handle various order ID formats", async () => {
    expect(await getOrderStatus("ord_456")).toBe("pending");
    expect(await getOrderStatus("abc123")).toBe("pending");
    expect(await getOrderStatus("x")).toBe("pending");
  });

  it("should return promise that resolves", async () => {
    const promise = getOrderStatus("ord_789");
    expect(promise).toBeInstanceOf(Promise);
    const result = await promise;
    expect(result).toBe("pending");
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("should contain expected currencies", () => {
    expect(SUPPORTED_CURRENCIES).toContain("USD");
    expect(SUPPORTED_CURRENCIES).toContain("EUR");
    expect(SUPPORTED_CURRENCIES).toContain("GBP");
    expect(SUPPORTED_CURRENCIES).toContain("JPY");
  });

  it("should have exactly 4 currencies", () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(4);
  });

  it("should be readonly array", () => {
    const currencies: readonly string[] = SUPPORTED_CURRENCIES;
    expect(currencies).toBeDefined();
  });
});
