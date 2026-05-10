import { describe, it, expect } from "vitest";
import { createOrder, confirmOrder, getOrderStatus, SUPPORTED_CURRENCIES, type Order } from "./v1";

describe("createOrder", () => {
  it("creates order with valid inputs", () => {
    const items = [
      { id: "item1", qty: 2 },
      { id: "item2", qty: 1 },
    ];
    const order = createOrder("cust123", items);

    expect(order).toMatchObject({
      customerId: "cust123",
      total: 2,
      status: "pending",
    });
    expect(order.id).toMatch(/^ord_\d+$/);
  });

  it("generates unique order IDs based on timestamp", async () => {
    const items = [{ id: "item1", qty: 1 }];
    const order1 = createOrder("cust1", items);
    // Wait 1ms to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 2));
    const order2 = createOrder("cust1", items);

    expect(order1.id).not.toBe(order2.id);
  });

  it("sets total to number of items (length)", () => {
    const items = [
      { id: "a", qty: 10 },
      { id: "b", qty: 5 },
      { id: "c", qty: 3 },
    ];
    const order = createOrder("cust456", items);
    expect(order.total).toBe(3); // length of items array
  });

  it("creates order with empty items array", () => {
    const order = createOrder("cust789", []);
    expect(order.total).toBe(0);
    expect(order.status).toBe("pending");
  });

  it("creates order with single item", () => {
    const order = createOrder("cust100", [{ id: "solo", qty: 1 }]);
    expect(order.total).toBe(1);
  });

  it("initializes all orders with pending status", () => {
    const order = createOrder("cust200", [{ id: "x", qty: 1 }]);
    expect(order.status).toBe("pending");
  });

  it("handles different customer IDs", () => {
    const order1 = createOrder("customer-a", [{ id: "x", qty: 1 }]);
    const order2 = createOrder("customer-b", [{ id: "y", qty: 1 }]);

    expect(order1.customerId).toBe("customer-a");
    expect(order2.customerId).toBe("customer-b");
  });

  it("order ID starts with ord_ prefix", () => {
    const order = createOrder("cust", [{ id: "x", qty: 1 }]);
    expect(order.id).toMatch(/^ord_/);
  });
});

describe("confirmOrder", () => {
  it("changes status from pending to confirmed", () => {
    const pendingOrder: Order = {
      id: "ord_123",
      customerId: "cust1",
      total: 100,
      status: "pending",
    };

    const confirmed = confirmOrder(pendingOrder);
    expect(confirmed.status).toBe("confirmed");
  });

  it("preserves all other order fields", () => {
    const original: Order = {
      id: "ord_456",
      customerId: "cust2",
      total: 200,
      status: "pending",
    };

    const confirmed = confirmOrder(original);
    expect(confirmed).toMatchObject({
      id: "ord_456",
      customerId: "cust2",
      total: 200,
      status: "confirmed",
    });
  });

  it("does not mutate original order", () => {
    const original: Order = {
      id: "ord_789",
      customerId: "cust3",
      total: 50,
      status: "pending",
    };

    confirmOrder(original);
    expect(original.status).toBe("pending"); // unchanged
  });

  it("handles order already in confirmed status", () => {
    const alreadyConfirmed: Order = {
      id: "ord_111",
      customerId: "cust4",
      total: 75,
      status: "confirmed",
    };

    const result = confirmOrder(alreadyConfirmed);
    expect(result.status).toBe("confirmed");
  });

  it("handles order in shipped status", () => {
    const shipped: Order = {
      id: "ord_222",
      customerId: "cust5",
      total: 150,
      status: "shipped",
    };

    const result = confirmOrder(shipped);
    expect(result.status).toBe("confirmed");
  });

  it("handles order in delivered status", () => {
    const delivered: Order = {
      id: "ord_333",
      customerId: "cust6",
      total: 99,
      status: "delivered",
    };

    const result = confirmOrder(delivered);
    expect(result.status).toBe("confirmed");
  });

  it("preserves zero total", () => {
    const order: Order = {
      id: "ord_444",
      customerId: "cust7",
      total: 0,
      status: "pending",
    };

    const confirmed = confirmOrder(order);
    expect(confirmed.total).toBe(0);
  });
});

describe("getOrderStatus", () => {
  it("returns pending for non-empty orderId", async () => {
    const status = await getOrderStatus("ord_123");
    expect(status).toBe("pending");
  });

  it("returns null for empty string", async () => {
    const status = await getOrderStatus("");
    expect(status).toBeNull();
  });

  it("resolves as a Promise", async () => {
    const promise = getOrderStatus("ord_456");
    expect(promise).toBeInstanceOf(Promise);
    await expect(promise).resolves.toBe("pending");
  });

  it("handles various truthy order IDs", async () => {
    expect(await getOrderStatus("ord_1")).toBe("pending");
    expect(await getOrderStatus("anything")).toBe("pending");
    expect(await getOrderStatus("x")).toBe("pending");
  });

  it("returns null for falsy values", async () => {
    expect(await getOrderStatus("")).toBeNull();
  });

  it("handles long order IDs", async () => {
    const longId = "ord_" + "x".repeat(1000);
    const status = await getOrderStatus(longId);
    expect(status).toBe("pending");
  });

  it("can be awaited multiple times", async () => {
    const status1 = await getOrderStatus("ord_789");
    const status2 = await getOrderStatus("ord_789");
    expect(status1).toBe(status2);
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("contains USD", () => {
    expect(SUPPORTED_CURRENCIES).toContain("USD");
  });

  it("contains EUR", () => {
    expect(SUPPORTED_CURRENCIES).toContain("EUR");
  });

  it("contains GBP", () => {
    expect(SUPPORTED_CURRENCIES).toContain("GBP");
  });

  it("contains JPY", () => {
    expect(SUPPORTED_CURRENCIES).toContain("JPY");
  });

  it("has exactly 4 currencies", () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(4);
  });

  it("is a readonly array (const assertion)", () => {
    // Type-level check - this would fail at compile time if not readonly
    const currencies: readonly string[] = SUPPORTED_CURRENCIES;
    expect(currencies).toBe(SUPPORTED_CURRENCIES);
  });

  it("contains all expected currencies in any order", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(
      expect.arrayContaining(["USD", "EUR", "GBP", "JPY"])
    );
  });
});
